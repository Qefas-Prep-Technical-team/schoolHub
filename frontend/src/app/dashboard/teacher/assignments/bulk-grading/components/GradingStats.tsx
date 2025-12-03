'use client';

import { AssignmentStats } from './types';

interface GradingStatsProps {
  stats: AssignmentStats;
}

export default function GradingStats({ stats }: GradingStatsProps) {
  const percentageGraded = stats.totalStudents > 0 
    ? ((stats.graded / stats.totalStudents) * 100).toFixed(0) 
    : '0';

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Graded */}
      <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Graded
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.graded} / {stats.totalStudents}
          </p>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({percentageGraded}%)
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percentageGraded}%` }}
          />
        </div>
      </div>

      {/* Ungraded */}
      <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Ungraded
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.ungraded}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {stats.totalStudents - stats.graded} remaining
        </p>
      </div>

      {/* Class Average */}
      <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Class Average
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.averageScore?.toFixed(1) || '--'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Out of 100 points
        </p>
      </div>

      {/* Completion Rate */}
      <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Completion Rate
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {stats.graded + stats.ungraded} / {stats.totalStudents}
          </p>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Submitted
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ 
              width: `${((stats.graded + stats.ungraded) / stats.totalStudents) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}