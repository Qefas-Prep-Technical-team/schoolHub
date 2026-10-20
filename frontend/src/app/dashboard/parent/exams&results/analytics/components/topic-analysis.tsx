"use client"

import React from 'react'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { SubjectAnalyticsData } from './types'

interface TopicAnalysisProps {
  data: SubjectAnalyticsData
}

export default function TopicAnalysis({ data }: TopicAnalysisProps) {
  const strengths = data.strengths || []
  const weaknesses = data.weaknesses || []

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          Competency Analysis
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Areas of academic distinction and growth priorities
        </p>
      </div>
      
      {/* Strengths */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Proficient Areas (≥70%)
          </span>
        </div>

        {strengths.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Foundations are actively consolidating across modules.
          </p>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      {/* Areas to Improve */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <AlertCircle size={14} className="text-orange-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Target Focus Areas (&lt;65%)
          </span>
        </div>

        {weaknesses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {weaknesses.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles size={13} className="shrink-0" />
            <span>Consistent mastery maintained across assessed curriculum criteria!</span>
          </div>
        )}
      </div>
    </div>
  )
}
