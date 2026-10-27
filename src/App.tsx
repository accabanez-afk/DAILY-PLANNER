/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { TaskList } from './components/TaskList';
import { PastTasksView } from './components/PastTasksView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { TaskModal } from './components/TaskModal';
import { AlarmAlertModal } from './components/AlarmAlertModal';
import { ExportModal } from './components/ExportModal';
import { TaskItem } from './types';
import {
  Bell,
  GraduationCap,
  MapPin,
  CalendarCheck,
  Plus,
  Edit3,
  UserCheck,
  AlertCircle,
  Database,
} from 'lucide-react';

function PlannerDashboard() {
  const { profile, currentUser, needsProfileSetup } = useAuth();
  const { tasks, selectedDate } = useTasks();

  const [currentTab, setCurrentTab] = useState<'planner' | 'history'>('planner');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Today's alarms count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAlarms = tasks.filter(
    (t) => t.date === todayStr && t.status === 'pending' && t.hasAlarm
  );

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNewTask={handleOpenNewTask}
        onOpenExport={() => setIsExportOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Student Profile Overview / Welcome Card */}
        {profile ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {profile.name ? profile.name.charAt(0) : 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">
                    {profile.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {profile.grade}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Strand: {profile.strand}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gender: {profile.gender}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{profile.address}</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Database className="w-3.5 h-3.5" />
                    <span>Database Synced</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile Details</span>
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Welcome to DAILY PLANNER!
                </h3>
                <p className="text-xs text-slate-600">
                  Sign up to create your student profile (Name, Gender, Address, Grade 7-12, Strand) and store your tasks to the cloud database.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Sign Up / Create Profile
              </button>
            </div>
          </div>
        )}

        {/* Reminders / Alarms Notification Banner */}
        {todayAlarms.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <Bell className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
              </span>
              <div>
                <span className="font-bold">
                  {todayAlarms.length} Active Reminder{todayAlarms.length > 1 ? 's' : ''} Today:
                </span>{' '}
                <span>
                  {todayAlarms.map((a) => a.title).join(' · ')}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 hidden sm:inline">
              Sound Alarm Armed
            </span>
          </div>
        )}

        {/* Tab View Content */}
        {currentTab === 'planner' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calendar Grid (7 cols on lg) */}
            <div className="lg:col-span-7">
              <CalendarView onOpenNewTask={handleOpenNewTask} />
            </div>

            {/* Selected Date Schedule & Tasks (5 cols on lg) */}
            <div className="lg:col-span-5 min-h-[460px]">
              <TaskList
                onOpenNewTask={handleOpenNewTask}
                onEditTask={handleEditTask}
              />
            </div>
          </div>
        ) : (
          /* Finished & Past Tasks History */
          <div>
            <PastTasksView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          DAILY PLANNER · Student Schedule, Task Alarms & Database Persistence
        </p>
      </footer>

      {/* Modals & Popups */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen || needsProfileSetup}
        onClose={() => setIsProfileOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        defaultDate={selectedDate}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Audio-Visual Alarm Modal (auto-opens when task alarm triggers) */}
      <AlarmAlertModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <PlannerDashboard />
      </TaskProvider>
    </AuthProvider>
  );
}
