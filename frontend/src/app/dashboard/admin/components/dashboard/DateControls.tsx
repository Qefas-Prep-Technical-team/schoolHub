'use client';

import { Calendar, School, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface DateControlsProps {
  onSessionChange?: (session: string) => void;
  onTermChange?: (term: string) => void;
  onQuickAction?: () => void;
}

export default function DateControls({
  onSessionChange,
  onTermChange,
  onQuickAction,
}: DateControlsProps) {
  const [selectedSession, setSelectedSession] = useState('2023/2024');
  const [selectedTerm, setSelectedTerm] = useState('Second Term');

  const sessions = ['2023/2024', '2022/2023', '2024/2025'];
  const terms = ['First Term', 'Second Term', 'Third Term', 'Summer Term'];

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    onSessionChange?.(session);
  };

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    onTermChange?.(term);
  };

  const currentDate = format(new Date(), 'MMM dd, yyyy');

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Snapshot of school operations for{' '}
          <span className="font-medium text-primary">{currentDate}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Session Selector */}
        <div className="flex items-center gap-2 bg-surface-light dark:bg-surface-dark px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="h-5 w-5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
              Session
            </span>
            <select
              value={selectedSession}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer h-auto leading-tight min-w-[100px]"
            >
              {sessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Term Selector */}
        <div className="flex items-center gap-2 bg-surface-light dark:bg-surface-dark px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <School className="h-5 w-5 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
              Term
            </span>
            <select
              value={selectedTerm}
              onChange={(e) => handleTermChange(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer h-auto leading-tight min-w-[110px]"
            >
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={onQuickAction}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm shadow-primary/30 flex items-center gap-2 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Quick Action</span>
        </button>
      </div>
    </div>
  );
}