'use client';

import React from 'react';
import { Users, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface RecordsStatsCardsProps {
  totalRecords: number;
  completedRecords: number;
  pendingRecords: number;
  completionRate: number;
  averageScore: string;
  activeTab: 'subject' | 'student';
}

export function RecordsStatsCards({
  totalRecords,
  completedRecords,
  pendingRecords,
  completionRate,
  averageScore,
  activeTab,
}: RecordsStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {/* Card 1: Total Records */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              Total {activeTab === 'student' ? 'Students' : 'Subjects'}
            </span>
          </div>
          <HeaderTooltip
            content="Total number of final result assessment sheets and compilation records configured under your teaching portfolio."
            size={13}
          />
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {totalRecords}
          </h3>
          <div className="flex items-center text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 sm:py-1 rounded-lg">
            <TrendingUp className="w-3 h-3 mr-1" />
            100%
          </div>
        </div>
      </div>

      {/* Card 2: Completed Records */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 sm:p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
              Completed
            </span>
          </div>
          <HeaderTooltip
            content="Published result sheets that have finalized student grade scores, calculated term ranks, and are available for term report generation."
            size={13}
          />
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {completedRecords}
          </h3>
          <div className="flex items-center text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 sm:py-1 rounded-lg">
            <TrendingUp className="w-3 h-3 mr-1" />
            {completionRate}%
          </div>
        </div>
      </div>

      {/* Card 3: Pending Records */}
      <div className="bg-white dark:bg-emerald-950/40 rounded-2xl border border-slate-200/80 dark:border-emerald-800/40 p-3.5 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 sm:p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
              Pending Drafts
            </span>
          </div>
          <HeaderTooltip
            content="Result sheets currently in draft status requiring score verification, grade synchronization, or formal publishing release."
            size={13}
          />
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {pendingRecords}
          </h3>
          <div className="flex items-center text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 sm:py-1 rounded-lg">
            {totalRecords > 0 ? 100 - completionRate : 0}%
          </div>
        </div>
      </div>

      {/* Card 4: Average Score */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-600 dark:to-emerald-900 rounded-2xl border border-emerald-500/20 p-3.5 sm:p-5 shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none">
          <TrendingUp className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 sm:p-2.5 bg-white/20 text-white rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-50 tracking-wide">
              Average Score
            </span>
          </div>
          <HeaderTooltip
            content="The composite arithmetic mean calculated across all published scholar score entries in the active grading term."
            size={13}
            className="text-emerald-100 hover:text-white"
          />
        </div>
        <div className="flex items-end justify-between relative z-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
            {averageScore}%
          </h3>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-100 bg-white/20 px-2 py-0.5 sm:py-1 rounded-lg backdrop-blur-sm">
            Cohort Mean
          </span>
        </div>
      </div>
    </div>
  );
}
