import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  Trophy,
  Calendar,
  Clock,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from '../types';

export const PastTasksView: React.FC = () => {
  const { tasks, toggleTaskStatus, deleteTask, updateTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Completed tasks
  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed');
  }, [tasks]);

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    completedTasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [completedTasks]);

  // Filtered completed tasks
  const filteredCompleted = useMemo(() => {
    return completedTasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [completedTasks, searchTerm, selectedCategory]);

  const handleReopenForToday = async (task: TaskItem) => {
    const today = new Date();
    const yStr = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yStr}-${mStr}-${dStr}`;

    await updateTask(task.id, {
      status: 'pending',
      date: todayStr,
      completedAt: undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Analytics & Streak Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Finished Tasks
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {completedTasks.length}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Completed student tasks
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completion Rate
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {completionRate}%
            </p>
            <p className="text-[11px] text-indigo-600 font-medium">
              {completedTasks.length} of {totalTasks} tasks finished
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Remaining
            </p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {pendingCount}
            </p>
            <p className="text-[11px] text-amber-600 font-medium">
              Active schedule tasks
            </p>
          </div>
        </div>
      </div>

      {/* Main Finished Tasks Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
              <span>Finished & Past Tasks History</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review completed homework, assignments, and study sessions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search past tasks..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-48 sm:w-60"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Subjects ({completedTasks.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Task Items List */}
        <div className="p-4 sm:p-5 divide-y divide-slate-100">
          {filteredCompleted.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No finished tasks yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When you check off tasks in the calendar or day schedule, they will appear here in your verified achievement history.
              </p>
            </div>
          ) : (
            filteredCompleted.map((task) => {
              const completedDateText = task.completedAt
                ? new Date(task.completedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Completed';

              return (
                <div
                  key={task.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-50" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">
                          {task.title}
                        </span>
                        {task.category && (
                          <span className="text-xs text-slate-500 font-medium">
                            · {task.category}
                          </span>
                        )}
                        {task.priority && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded text-slate-500 bg-slate-100">
                            {task.priority}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Scheduled: {task.date}</span>
                        </span>
                        {task.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.time}</span>
                          </span>
                        )}
                        <span className="text-emerald-600 font-medium">
                          ✓ Finished on {completedDateText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReopenForToday(task)}
                      title="Reopen task and move to Today"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Move to Today</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      title="Delete from history"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
