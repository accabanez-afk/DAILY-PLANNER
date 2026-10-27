import React, { useState } from 'react';
import {
  CalendarDays,
  Bell,
  Volume2,
  User as UserIcon,
  LogOut,
  LogIn,
  FileSpreadsheet,
  Plus,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { playChime, requestNotificationPermission } from '../utils/audio';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenNewTask: () => void;
  onOpenExport: () => void;
  currentTab: 'planner' | 'history';
  setCurrentTab: (tab: 'planner' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenNewTask,
  onOpenExport,
  currentTab,
  setCurrentTab,
}) => {
  const { profile, currentUser, logout } = useAuth();
  const { tasks } = useTasks();
  const [soundTested, setSoundTested] = useState(false);

  const pendingAlarmsCount = tasks.filter(
    (t) => t.status === 'pending' && t.hasAlarm
  ).length;

  const handleTestChime = () => {
    playChime();
    requestNotificationPermission();
    setSoundTested(true);
    setTimeout(() => setSoundTested(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  DAILY PLANNER
                </h1>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Student Schedule & Task Tracker
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setCurrentTab('planner')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  currentTab === 'planner'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calendar & Planner
              </button>
              <button
                onClick={() => setCurrentTab('history')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  currentTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Finished & Past Tasks
              </button>
            </nav>
          </div>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Alarm sound test */}
            <button
              onClick={handleTestChime}
              title="Test Alarm Chime Sound"
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                soundTested
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">
                {soundTested ? 'Sound Playing!' : 'Test Alarm'}
              </span>
            </button>

            {/* Google Sheets / CSV Export */}
            <button
              onClick={onOpenExport}
              title="Export to Google Sheets or CSV"
              className="p-2 sm:px-3 sm:py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Sheets / CSV</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Profile / Auth */}
            {profile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-colors text-left"
                  title="View / Edit Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase border border-indigo-200">
                    {profile.name ? profile.name.charAt(0) : 'S'}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {profile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {profile.grade} · {profile.strand}
                    </p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Set Up Profile</span>
                </button>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary tab row */}
        <div className="flex md:hidden border-t border-slate-100 py-2 items-center justify-between">
          <div className="flex items-center gap-1 w-full">
            <button
              onClick={() => setCurrentTab('planner')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md text-center transition-all ${
                currentTab === 'planner'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600'
              }`}
            >
              Calendar & Planner
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md text-center transition-all ${
                currentTab === 'history'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600'
              }`}
            >
              Past & Finished Tasks
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
