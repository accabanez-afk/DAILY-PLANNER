import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { useAuth } from './AuthContext';
import { TaskItem, ActiveAlarm } from '../types';
import { startAlarmLoop, stopAlarmLoop, triggerDesktopNotification } from '../utils/audio';

interface TaskContextType {
  tasks: TaskItem[];
  loading: boolean;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  activeAlarm: ActiveAlarm | null;
  dismissAlarm: () => void;
  snoozeAlarm: (minutes?: number) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_TASKS_KEY = 'daily_planner_cached_tasks';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_TASKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Selected date defaults to today (local YYYY-MM-DD)
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);

  // Track task IDs that already triggered an alarm to avoid repeated alerts in the same session
  const triggeredAlarmIdsRef = useRef<Set<string>>(new Set());
  // Store snoozed tasks with resume timestamp
  const snoozedTasksRef = useRef<Map<string, number>>(new Map());

  const effectiveUserId = currentUser?.uid || profile?.uid;

  // Real-time Firestore sync
  useEffect(() => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    const tasksColRef = collection(db, 'users', effectiveUserId, 'tasks');
    setLoading(true);

    const unsubscribe = onSnapshot(
      tasksColRef,
      (snapshot) => {
        const loadedTasks: TaskItem[] = [];
        snapshot.forEach((docSnap) => {
          loadedTasks.push({ id: docSnap.id, ...(docSnap.data() as Omit<TaskItem, 'id'>) });
        });

        // Sort by date then time
        loadedTasks.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return (a.time || '00:00').localeCompare(b.time || '00:00');
        });

        setTasks(loadedTasks);
        localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(loadedTasks));
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore onSnapshot error, falling back to local tasks:', error);
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, `users/${effectiveUserId}/tasks`);
      }
    );

    return () => unsubscribe();
  }, [effectiveUserId]);

  // Alarm and Reminder Detection Engine
  useEffect(() => {
    const checkAlarms = () => {
      if (activeAlarm) return; // Already alarming
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDay = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${currentYear}-${currentMonth}-${currentDay}`;
      const currentTimeMs = now.getTime();

      for (const task of tasks) {
        if (task.status === 'completed' || !task.hasAlarm || !task.time) {
          continue;
        }

        // Check if snoozed
        const snoozedUntil = snoozedTasksRef.current.get(task.id);
        if (snoozedUntil) {
          if (currentTimeMs >= snoozedUntil) {
            // Snooze expired! Trigger alarm
            snoozedTasksRef.current.delete(task.id);
            triggerAlarmForTask(task);
            break;
          }
          continue;
        }

        // If already triggered
        if (triggeredAlarmIdsRef.current.has(task.id)) {
          continue;
        }

        // Calculate target trigger time
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskTargetDate = new Date(`${task.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
        const offsetMs = (task.alarmOffsetMinutes || 0) * 60 * 1000;
        const triggerTimeMs = taskTargetDate.getTime() - offsetMs;

        // If current time is within [triggerTimeMs, triggerTimeMs + 10 minutes] and task is today or scheduled
        if (currentTimeMs >= triggerTimeMs && currentTimeMs <= triggerTimeMs + 15 * 60 * 1000) {
          triggeredAlarmIdsRef.current.add(task.id);
          triggerAlarmForTask(task);
          break;
        }
      }
    };

    const interval = setInterval(checkAlarms, 5000);
    checkAlarms(); // Initial immediate check

    return () => clearInterval(interval);
  }, [tasks, activeAlarm]);

  const triggerAlarmForTask = useCallback((task: TaskItem) => {
    setActiveAlarm({
      task,
      triggeredAt: Date.now(),
    });

    // Start pleasant audio loop
    startAlarmLoop();

    // Browser desktop notification
    triggerDesktopNotification(`Planner Alarm: ${task.title}`, {
      body: `Scheduled for ${task.time || 'today'} (${task.category || 'Task'}). Tap to view details.`,
      tag: `alarm-${task.id}`,
    });
  }, []);

  const dismissAlarm = useCallback(() => {
    stopAlarmLoop();
    setActiveAlarm(null);
  }, []);

  const snoozeAlarm = useCallback((minutes = 5) => {
    if (!activeAlarm) return;
    const taskId = activeAlarm.task.id;
    stopAlarmLoop();
    snoozedTasksRef.current.set(taskId, Date.now() + minutes * 60 * 1000);
    setActiveAlarm(null);
  }, [activeAlarm]);

  const addTask = async (taskData: Omit<TaskItem, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const uid = effectiveUserId || 'anonymous_user';
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newTask: TaskItem = {
      ...taskData,
      id: taskId,
      userId: uid,
      status: 'pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Optimistic UI update
    setTasks((prev) => [...prev, newTask]);

    if (effectiveUserId) {
      try {
        const docRef = doc(db, 'users', effectiveUserId, 'tasks', taskId);
        await setDoc(docRef, newTask);
      } catch (err) {
        console.error('Error adding task to Firestore:', err);
        handleFirestoreError(err, OperationType.WRITE, `users/${effectiveUserId}/tasks/${taskId}`);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    const nowIso = new Date().toISOString();
    const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: nowIso } : t));
    setTasks(updatedTasks);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(updatedTasks));

    if (effectiveUserId) {
      try {
        const docRef = doc(db, 'users', effectiveUserId, 'tasks', id);
        await setDoc(docRef, { ...updates, updatedAt: nowIso }, { merge: true });
      } catch (err) {
        console.error('Error updating task in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `users/${effectiveUserId}/tasks/${id}`);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (effectiveUserId) {
      try {
        const docRef = doc(db, 'users', effectiveUserId, 'tasks', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('Error deleting task in Firestore:', err);
        handleFirestoreError(err, OperationType.DELETE, `users/${effectiveUserId}/tasks/${id}`);
      }
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const isNowCompleted = newStatus === 'completed';

    if (isNowCompleted) {
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
      // If alarm is ringing for this task, dismiss it
      if (activeAlarm?.task.id === id) {
        dismissAlarm();
      }
    }

    await updateTask(id, {
      status: newStatus,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        selectedDate,
        setSelectedDate,
        activeAlarm,
        dismissAlarm,
        snoozeAlarm,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
