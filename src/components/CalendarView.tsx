import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

interface CalendarViewProps {
  onOpenNewTask: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenNewTask }) => {
  const { tasks, selectedDate, setSelectedDate } = useTasks();

  // Active viewing month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const yStr = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  // Group tasks by date for fast lookup
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, { total: number; pending: number; completed: number; hasAlarm: boolean }>();
    for (const t of tasks) {
      const entry = map.get(t.date) || { total: 0, pending: 0, completed: 0, hasAlarm: false };
      entry.total += 1;
      if (t.status === 'completed') {
        entry.completed += 1;
      } else {
        entry.pending += 1;
        if (t.hasAlarm) entry.hasAlarm = true;
      }
      map.set(t.date, entry);
    }
    return map;
  }, [tasks]);

  // Today string YYYY-MM-DD
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // Build grid calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dNum);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNumber: dNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= (remainingCells >= 7 ? remainingCells - 7 : remainingCells); d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Formatting selected date label
  const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
  const selectedDateObj = new Date(sYear, sMonth - 1, sDay);
  const selectedDateLabel = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const selectedDayInfo = tasksByDate.get(selectedDate);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Header Controls */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Selected:</span>
              <span className="font-semibold text-indigo-600">{selectedDateLabel}</span>
              {selectedDayInfo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{selectedDayInfo.total} task{selectedDayInfo.total === 1 ? '' : 's'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/50">
        {calendarCells.map((cell) => {
          const isSelected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;
          const taskInfo = tasksByDate.get(cell.dateStr);

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => setSelectedDate(cell.dateStr)}
              className={`min-h-[82px] sm:min-h-[96px] p-1.5 sm:p-2 text-left bg-white transition-all relative flex flex-col justify-between group hover:bg-indigo-50/30 ${
                !cell.isCurrentMonth ? 'text-slate-300 bg-slate-50/40' : 'text-slate-800'
              } ${isSelected ? 'ring-2 ring-inset ring-indigo-600 bg-indigo-50/20' : ''}`}
            >
              {/* Day header & Badges */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                    isToday
                      ? 'bg-indigo-600 text-white font-bold'
                      : isSelected
                      ? 'bg-indigo-100 text-indigo-700 font-bold'
                      : ''
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Alarm indicator */}
                {taskInfo?.hasAlarm && (
                  <span
                    title="Active Alarm scheduled"
                    className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]"
                  >
                    <Bell className="w-2.5 h-2.5 fill-amber-500" />
                  </span>
                )}
              </div>

              {/* Task indicators inside cell */}
              <div className="mt-1 flex flex-col gap-1 w-full overflow-hidden">
                {taskInfo && (
                  <div className="flex items-center gap-1">
                    {taskInfo.pending > 0 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{taskInfo.pending}</span>
                      </span>
                    )}
                    {taskInfo.completed > 0 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{taskInfo.completed}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick hover add button */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-end">
                <span className="text-[10px] text-indigo-600 font-semibold flex items-center">
                  + Add
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Calendar Bottom Legend */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Pending Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Finished Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Alarm Set</span>
          </div>
        </div>

        <button
          onClick={onOpenNewTask}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task on {selectedDateLabel}</span>
        </button>
      </div>
    </div>
  );
};
