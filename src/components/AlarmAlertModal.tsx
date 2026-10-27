import React from 'react';
import { Bell, Clock, Check, X, BellOff, Volume2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const AlarmAlertModal: React.FC = () => {
  const { activeAlarm, dismissAlarm, snoozeAlarm, toggleTaskStatus } = useTasks();

  if (!activeAlarm) return null;

  const { task } = activeAlarm;

  const handleMarkAsDone = async () => {
    await toggleTaskStatus(task.id);
    dismissAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-400 w-full max-w-md overflow-hidden animate-bounce-once">
        {/* Banner with pulsing alarm bell */}
        <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-center relative">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner ring-4 ring-white/30 animate-pulse">
            <Bell className="w-8 h-8 text-white fill-white animate-bounce" />
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            PLANNER ALARM RINGING!
          </h3>
          <p className="text-amber-100 text-xs font-medium mt-1">
            Scheduled task reminder is active
          </p>

          <button
            onClick={dismissAlarm}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Details */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-bold text-slate-900 leading-snug">
              {task.title}
            </h4>

            {task.category && (
              <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">
                {task.category}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 mt-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {task.time || 'Today'} · {task.date}
              </span>
            </div>

            {task.description && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left whitespace-pre-line">
                {task.description}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleMarkAsDone}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Mark as Finished & Stop Alarm</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => snoozeAlarm(5)}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Snooze (5 Mins)</span>
              </button>

              <button
                type="button"
                onClick={dismissAlarm}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <BellOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
