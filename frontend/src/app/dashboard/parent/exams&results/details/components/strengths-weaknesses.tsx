"use client"

import React from 'react'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { ExamDetailData } from './types'

interface StrengthsWeaknessesProps {
  data: ExamDetailData
}

export default function StrengthsWeaknesses({ data }: StrengthsWeaknessesProps) {
  const strengths = data.strengths.length > 0
    ? data.strengths
    : data.subjects.filter(s => s.percentage >= 70).map(s => `${s.name} (${s.percentage}%)`)

  const weaknesses = data.weaknesses.length > 0
    ? data.weaknesses
    : data.subjects
        .filter(s => s.percentage < 65)
        .map(s => ({
          name: s.name,
          description: `Scored ${s.percentage}% (${s.score}/${s.totalMarks}) - review core concepts`
        }))

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Strengths */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="size-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={14} />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Areas of Strength
          </h4>
        </div>

        {strengths.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((st, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg"
              >
                {st}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Solid overall foundational progression across papers.
          </p>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      {/* Weaknesses / Focus areas */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="size-6 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <AlertCircle size={14} />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Focus & Growth Areas
          </h4>
        </div>

        {weaknesses.length > 0 ? (
          <div className="space-y-2">
            {weaknesses.map((w, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 text-xs"
              >
                <span className="font-bold text-orange-800 dark:text-orange-300 block">
                  {w.name}
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 block">
                  {w.description}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>Exceeded passing marks across all evaluated subject papers!</span>
          </div>
        )}
      </div>
    </div>
  )
}
