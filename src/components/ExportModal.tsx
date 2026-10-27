import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Copy, Check, Table } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { tasks } = useTasks();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate CSV text
  const headers = [
    'Task Title',
    'Date',
    'Time',
    'Subject / Category',
    'Priority',
    'Status',
    'Alarm Enabled',
    'Description',
    'Completed At',
  ];

  const escapeCsv = (str?: string) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvRows = [
    headers.join(','),
    ...tasks.map((t) =>
      [
        escapeCsv(t.title),
        escapeCsv(t.date),
        escapeCsv(t.time || ''),
        escapeCsv(t.category || ''),
        escapeCsv(t.priority || 'medium'),
        escapeCsv(t.status),
        escapeCsv(t.hasAlarm ? 'Yes' : 'No'),
        escapeCsv(t.description || ''),
        escapeCsv(t.completedAt || ''),
      ].join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');

  // Download CSV file
  const handleDownloadCsv = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const studentName = profile?.name ? profile.name.replace(/\s+/g, '_') : 'Student';
    link.download = `DAILY_PLANNER_${studentName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard for instant pasting into Google Sheets
  const handleCopyForGoogleSheets = async () => {
    // For direct paste into Google Sheets, tab-delimited values paste cleanly into columns
    const tsvRows = [
      headers.join('\t'),
      ...tasks.map((t) =>
        [
          t.title.replace(/\t/g, ' '),
          t.date,
          t.time || '',
          t.category || '',
          t.priority || 'medium',
          t.status,
          t.hasAlarm ? 'Yes' : 'No',
          (t.description || '').replace(/\t/g, ' ').replace(/\n/g, ' '),
          t.completedAt || '',
        ].join('\t')
      ),
    ];
    const tsvContent = tsvRows.join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Google Sheets & CSV Export
              </h2>
              <p className="text-xs text-slate-500">
                Backup all {tasks.length} tasks and profile data to spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900">
            <p className="font-semibold mb-1">
              Google Sheet Integration:
            </p>
            <p className="text-emerald-800 leading-relaxed">
              Your tasks are continuously synchronized to the Firestore cloud database. You can also export or copy directly to paste into any Google Sheet.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCopyForGoogleSheets}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Table className="w-5 h-5 text-emerald-600" />
                  {copied ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Copy for Google Sheets
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Copies clipboard formatted data. Simply open Google Sheets and press Ctrl+V.
                </p>
              </div>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px] font-semibold text-slate-500">
                    .CSV File
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Download CSV
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Downloads comma-separated values file compatible with Google Drive and Excel.
                </p>
              </div>
            </button>
          </div>

          {/* Preview snippet */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Preview Data ({tasks.length} rows)
            </label>
            <div className="bg-slate-900 text-slate-200 text-[11px] font-mono p-3 rounded-lg overflow-x-auto max-h-36">
              <pre>{csvContent.slice(0, 450)}...</pre>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
