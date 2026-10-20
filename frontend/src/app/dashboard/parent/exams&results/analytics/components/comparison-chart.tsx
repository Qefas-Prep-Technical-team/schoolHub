"use client"

import React from 'react'
import { SubjectAnalyticsData } from './types'

interface ComparisonChartProps {
  data: SubjectAnalyticsData
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const categories = data.categories || []

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
          Vs. Class Average
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Performance by assessment category vs cohort
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">
          No category distribution data available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((item, index) => {
            const isAbove = item.score >= item.classAverage
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.category} ({item.count})
                  </span>
                  <span className={`font-black ${
                    isAbove ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.score}% {isAbove ? '• Above Avg' : '• Near Avg'}
                  </span>
                </div>

                <div className="h-4 flex w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  {/* Marker for Class Avg */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-slate-400 dark:bg-slate-500 z-10"
                    style={{ left: `${Math.min(100, Math.max(5, item.classAverage))}%` }}
                    title={`Class Avg: ${item.classAverage}%`}
                  />
                  {/* Student Score Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAbove ? 'bg-orange-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Student: {item.score}%</span>
                  <span>Cohort Avg: {item.classAverage}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
