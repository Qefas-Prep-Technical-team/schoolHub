"use client";

import React from 'react';
import { Users, CheckCircle2, TrendingUp, Award, Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface OfflineGradesStatsProps {
  totalStudents: number;
  gradedCount: number;
  averageScore: number;
  maxMarks: number;
  passCount: number;
  isTeacher?: boolean;
}

export default function OfflineGradesStats({
  totalStudents,
  gradedCount,
  averageScore,
  maxMarks,
  passCount,
  isTeacher = false,
}: OfflineGradesStatsProps) {
  const percentage = maxMarks > 0 ? Math.round((averageScore / maxMarks) * 100) : 0;
  const passRate = gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 0;
  const pendingCount = Math.max(0, totalStudents - gradedCount);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6">
      {/* 1. Enrolled Students */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group ${isTeacher ? 'hover:border-emerald-300 dark:hover:border-emerald-800' : 'hover:border-indigo-300 dark:hover:border-indigo-800'} transition-all`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Students
          </span>
          <div className={`size-8 sm:size-9 rounded-xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'} flex items-center justify-center`}>
            <Users size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalStudents}
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">enrolled</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className={`${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} h-full rounded-full w-full`} />
        </div>
      </div>

      {/* 2. Graded Count */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Graded Status
          </span>
          <div className="size-8 sm:size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {gradedCount}
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            / {totalStudents} ({totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0}%)
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${totalStudents > 0 ? (gradedCount / totalStudents) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 3. Class Average */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-800 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Class Average
          </span>
          <div className="size-8 sm:size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {gradedCount > 0 ? averageScore.toFixed(1) : '—'}
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            / {maxMarks} ({percentage}%)
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* 4. Pass Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pass Rate
            </span>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs bg-slate-900 text-white max-w-xs p-2">
                  Percentage of graded students who attained 50% or higher of the maximum marks.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="size-8 sm:size-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
            {gradedCount > 0 ? `${passRate}%` : '—'}
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            ({passCount} passed)
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
