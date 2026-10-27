import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bell,
  Volume2,
  Tag,
  AlertCircle,
  FileText,
  Check,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskItem, TaskPriority } from '../types';
import { playChime, requestNotificationPermission } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: TaskItem | null;
  defaultDate?: string;
}

const CATEGORY_PRESETS = [
  'Mathematics',
  'Science',
  'English',
  'Filipino',
  'Araling Panlipunan',
  'ICT & TLE',
  'Research & Project',
  'Exam Review',
  'Homework',
  'Personal',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  initialTask,
  defaultDate,
}) => {
  const { addTask, updateTask, selectedDate } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || selectedDate);
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState('Mathematics');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [hasAlarm, setHasAlarm] = useState(true);
  const [alarmOffsetMinutes, setAlarmOffsetMinutes] = useState(0); // 0 = at time

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setDate(initialTask.date || defaultDate || selectedDate);
      setTime(initialTask.time || '09:00');
      setCategory(initialTask.category || 'Mathematics');
      setPriority(initialTask.priority || 'medium');
      setHasAlarm(initialTask.hasAlarm ?? true);
      setAlarmOffsetMinutes(initialTask.alarmOffsetMinutes ?? 0);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || selectedDate);
      // Default to next hour
      const now = new Date();
      const currentH = String((now.getHours() + 1) % 24).padStart(2, '0');
      setTime(`${currentH}:00`);
      setCategory('Mathematics');
      setPriority('medium');
      setHasAlarm(true);
      setAlarmOffsetMinutes(0);
    }
    setErrorMsg(null);
  }, [initialTask, isOpen, defaultDate, selectedDate]);

  if (!isOpen) return null;

  const handleTestChime = () => {
    playChime();
    requestNotificationPermission();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }
    if (!date) {
      setErrorMsg('Task date is required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      if (hasAlarm) {
        requestNotificationPermission();
      }

      if (initialTask) {
        await updateTask(initialTask.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          time,
          category,
          priority,
          hasAlarm,
          alarmOffsetMinutes,
        });
      } else {
        await addTask({
          title: title.trim(),
          description: description.trim(),
          date,
          time,
          category,
          priority,
          hasAlarm,
          alarmOffsetMinutes,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save task.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'Add New Daily Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan your study sessions, homework, and set reminder alarms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Chapter 4 Review / Math Problem Set"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            />
          </div>

          {/* Subject / Category Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Subject / Category
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    category === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Or type custom category..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Scheduled Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Scheduled Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-400'
                        : p === 'medium'
                        ? 'bg-amber-50 border-amber-300 text-amber-700 ring-1 ring-amber-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p} Priority
                </button>
              ))}
            </div>
          </div>

          {/* Alarm / Reminder Box */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAlarm}
                  onChange={(e) => setHasAlarm(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  Set Reminder & Sound Alarm
                </span>
              </label>

              <button
                type="button"
                onClick={handleTestChime}
                title="Preview alarm sound"
                className="text-[11px] font-medium text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Test Sound</span>
              </button>
            </div>

            {hasAlarm && (
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-600">Alarm Timing:</span>
                <select
                  value={alarmOffsetMinutes}
                  onChange={(e) => setAlarmOffsetMinutes(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={0}>At scheduled time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>
            )}
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, page numbers, links or study instructions..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {saving ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{initialTask ? 'Update Task' : 'Save Task to Planner'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
