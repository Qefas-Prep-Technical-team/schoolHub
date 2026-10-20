"use client"

import React from 'react'
import { BookOpen, User, CheckCircle2 } from 'lucide-react'
import { ExamDetailData } from './types'

interface PerformanceBreakdownProps {
  data: ExamDetailData
}

export default function PerformanceBreakdown({ data }: PerformanceBreakdownProps) {
  const subjects = data.subjects.length > 0 
    ? data.subjects 
    : [{
        id: data.id,
        name: data.title,
        score: data.score,
        totalMarks: data.totalScore,
        percentage: data.percentage,
        teacher: 'Subject Faculty',
        remarks: 'Performance recorded successfully.'
      }]

  function getBarColor(pct: number) {
    if (pct >= 80) return 'bg-emerald-500'
    if (pct >= 60) return 'bg-orange-500'
    if (pct >= 50) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  function getBadgeColor(pct: number) {
    if (pct >= 80) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20'
    if (pct >= 60) return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-500/20'
    if (pct >= 50) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-500/20'
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-500/20'
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Performance Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise evaluation and marks breakdown
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          {subjects.length} {subjects.length === 1 ? 'Paper' : 'Papers'}
        </span>
      </div>

      <div className="space-y-4">
        {subjects.map((sub, idx) => (
          <div 
            key={sub.id || idx}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    {sub.name}
                  </h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getBadgeColor(sub.percentage)}`}>
                    {sub.percentage}%
                  </span>
                </div>
                {sub.teacher && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User size={12} className="text-slate-400" />
                    <span>{sub.teacher}</span>
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {sub.score}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  /{sub.totalMarks}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(sub.percentage)}`}
                style={{ width: `${Math.min(100, Math.max(5, sub.percentage))}%` }}
              />
            </div>

            {sub.remarks && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800">
                &ldquo;{sub.remarks}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
