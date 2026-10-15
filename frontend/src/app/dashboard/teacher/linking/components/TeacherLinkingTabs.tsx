'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface TeacherLinkingTabsProps {
  isPersonal: boolean;
  mainTab: 'network' | 'classroom';
  setMainTab: (tab: 'network' | 'classroom') => void;
  subTab: 'active' | 'pending';
  setSubTab: (tab: 'active' | 'pending') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  networkPendingCount: number;
  classroomPendingCount: number;
  activeCount: number;
  pendingCount: number;
  isLoadingActive: boolean;
  isLoadingRequests: boolean;
}

export function TeacherLinkingTabs({
  isPersonal,
  mainTab,
  setMainTab,
  subTab,
  setSubTab,
  searchQuery,
  setSearchQuery,
  networkPendingCount,
  classroomPendingCount,
  activeCount,
  pendingCount,
  isLoadingActive,
  isLoadingRequests,
}: TeacherLinkingTabsProps) {
  const currentPendingCount = isPersonal
    ? mainTab === 'network'
      ? networkPendingCount
      : classroomPendingCount
    : pendingCount;

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
        {/* Category Toggle (Personal Mode Only) */}
        {isPersonal && (
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl w-full sm:w-auto border border-slate-200/80 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setMainTab('network')}
              className={cn(
                'flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                mainTab === 'network'
                  ? 'bg-white dark:bg-emerald-950/60 shadow-sm text-emerald-600 dark:text-emerald-400 border border-slate-200/60 dark:border-emerald-700/50'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              Network
            </button>
            <button
              type="button"
              onClick={() => setMainTab('classroom')}
              className={cn(
                'flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                mainTab === 'classroom'
                  ? 'bg-white dark:bg-emerald-950/60 shadow-sm text-emerald-600 dark:text-emerald-400 border border-slate-200/60 dark:border-emerald-700/50'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              Classroom
            </button>
          </div>
        )}

        {/* Status Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-zinc-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubTab('active')}
            className={cn(
              'flex-1 sm:flex-none h-9 sm:h-10 px-3.5 sm:px-5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5',
              subTab === 'active'
                ? 'bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-emerald-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <span>Connected</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {isLoadingActive ? '···' : activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('pending')}
            className={cn(
              'flex-1 sm:flex-none h-9 sm:h-10 px-3.5 sm:px-5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5',
              subTab === 'pending'
                ? 'bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-emerald-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <span>Pending</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {isLoadingRequests ? '···' : pendingCount}
            </span>
            {currentPendingCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full lg:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search linked members..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
