import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  Trash2,
  Edit2,
  Plus,
  Calendar,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskItem } from '../types';

interface TaskListProps {
  onOpenNewTask: () => void;
  onEditTask: (task: TaskItem) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onOpenNewTask, onEditTask }) => {
  const { tasks, selectedDate, toggleTaskStatus, deleteTask } = useTasks();
  const [filterMode, setFilterMode] = useState<'selected_date' | 'all_pending'>('selected_date');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'selected_date') {
      return t.date === selectedDate;
    }
    return t.status === 'pending';
  });

  const pendingCount = filteredTasks.filter((t) => t.status === 'pending').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;

  // Formatting date header
  const [y, m, d] = selectedDate.split('-').map(Number);
  const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {filterMode === 'selected_date' ? 'Day Schedule' : 'All Upcoming Tasks'}
            </h3>
            <span className="text-xs text-slate-500">
              ({pendingCount} pending, {completedCount} finished)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {filterMode === 'selected_date' ? formattedDate : 'Viewing all pending tasks across all dates'}
          </p>
        </div>

        {/* View toggle & Add button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('selected_date')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterMode === 'selected_date'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selected Date
            </button>
            <button
              onClick={() => setFilterMode('all_pending')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterMode === 'all_pending'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Pending
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Items List */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No tasks planned yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              {filterMode === 'selected_date'
                ? `You don't have any tasks scheduled for ${formattedDate}. Click below to add your homework or to-do item.`
                : 'Great job! You have no pending tasks scheduled.'}
            </p>
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task for {formattedDate}</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  title={isCompleted ? 'Mark as pending' : 'Mark as finished'}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                  )}
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold leading-tight ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Category */}
                    {task.category && (
                      <span className="text-[11px] font-medium text-slate-500">
                        · {task.category}
                      </span>
                    )}

                    {/* Priority Indicator */}
                    {task.priority && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                          task.priority === 'high'
                            ? 'text-rose-600 bg-rose-50 border border-rose-200'
                            : task.priority === 'medium'
                            ? 'text-amber-600 bg-amber-50 border border-amber-200'
                            : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>

                  {/* Description / Notes */}
                  {task.description && (
                    <p
                      className={`text-xs mt-1 text-slate-600 whitespace-pre-line line-clamp-2 ${
                        isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Meta items: Time, Alarm, Date */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                    {task.time && (
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.time}</span>
                      </span>
                    )}

                    {filterMode === 'all_pending' && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.date}</span>
                      </span>
                    )}

                    {task.hasAlarm && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Bell className="w-3 h-3 fill-amber-500" />
                        <span>
                          Alarm {task.alarmOffsetMinutes ? `(${task.alarmOffsetMinutes}m before)` : '(On time)'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons (Edit / Delete) */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    title="Edit Task"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    title="Delete Task"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
