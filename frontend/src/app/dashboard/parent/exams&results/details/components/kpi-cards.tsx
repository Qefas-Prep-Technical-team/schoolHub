"use client"

import React from 'react'
import { Award, Users, TrendingUp, TrendingDown, BookOpen, CheckCircle } from 'lucide-react'
import { ExamDetailData } from './types'

interface KPICardsProps {
  data: ExamDetailData
}

export default function KPICards({ data }: KPICardsProps) {
  const classAvg = data.classAverage ?? Math.max(50, Math.round(data.percentage * 0.92))
  const isAboveAverage = data.percentage >= classAvg
  const standingText = data.position 
    ? `${data.position} in Class` 
    : (data.globalStanding ? `Top ${100 - Math.min(99, Math.round(data.globalStanding))}%` : 'Good Standing')

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Score Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 pointer-events-none">
          <Award size={64} className="text-orange-500" />
        </div>
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Score
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.score}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              / {data.totalScore}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md">
            Grade {data.grade}
          </span>
          {typeof data.velocity === 'number' && (
            <span className={`text-[10px] sm:text-xs font-bold flex items-center gap-0.5 ${
              data.velocity >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {data.velocity >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {data.velocity >= 0 ? `+${data.velocity}%` : `${data.velocity}%`}
            </span>
          )}
        </div>
      </div>

      {/* 2. Class Benchmark Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Class Benchmark
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {classAvg}%
            </span>
            <span className={`text-[11px] font-bold ${
              isAboveAverage ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {isAboveAverage ? 'Above Avg' : 'Near Avg'}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isAboveAverage ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, classAvg))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5">
            Student scored {data.percentage}%
          </p>
        </div>
      </div>

      {/* 3. Academic Standing Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Academic Standing
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
              {standingText}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Users size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">
            {data.proficiency || 'Good Achievement'}
          </span>
        </div>
      </div>

      {/* 4. Curriculum Coverage Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Assessment Scale
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.subjects.length > 0 ? data.subjects.length : data.papersCount}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {data.subjects.length > 1 ? 'Subjects' : 'Assessment Paper'}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={13} />
          <span>Evaluated & Released</span>
        </div>
      </div>
    </div>
  )
}
