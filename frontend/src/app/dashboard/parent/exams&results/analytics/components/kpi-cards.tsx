"use client"

import React from 'react'
import { Award, TrendingUp, TrendingDown, Target, ClipboardList, CheckCircle2 } from 'lucide-react'
import { SubjectAnalyticsData } from './types'

interface KPICardsProps {
  data: SubjectAnalyticsData
}

export default function KPICards({ data }: KPICardsProps) {
  const isAboveAverage = data.averageScore >= data.classAverage

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Weighted Average Score */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Current Average
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.averageScore}%
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              (Grade {data.grade})
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, data.averageScore))}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {data.trend.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{data.trend.value}</span>
          </div>
        </div>
      </div>

      {/* 2. Class Benchmark */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Class Benchmark
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.classAverage}%
            </span>
            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${
              isAboveAverage 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}>
              {isAboveAverage ? 'Above Avg' : 'Near Avg'}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAboveAverage ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, data.classAverage))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {isAboveAverage ? 'Exceeds overall cohort baseline' : 'Consistent with class cohort'}
          </p>
        </div>
      </div>

      {/* 3. Performance Peak & Range */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Score Range
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.highestScore}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              (Peak Mark)
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Lowest: <strong className="text-slate-700 dark:text-slate-300">{data.lowestScore}%</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={12} />
            Verified
          </span>
        </div>
      </div>

      {/* 4. Assessment Volume */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Evaluated Papers
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.totalAssessments}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Assessments
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <ClipboardList size={13} className="text-orange-500" />
          <span>Tests, exams & coursework</span>
        </div>
      </div>
    </div>
  )
}
