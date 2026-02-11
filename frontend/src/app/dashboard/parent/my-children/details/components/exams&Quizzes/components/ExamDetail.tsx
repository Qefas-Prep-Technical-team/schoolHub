'use client'

import { FunctionSquare as Functions, Calendar as CalendarToday,CalendarCheck as Schedule, Verified, Lightbulb } from 'lucide-react'
import PerformanceComparison from './PerformanceComparison'
import QuestionBreakdown from './QuestionBreakdown'

export default function ExamDetail() {
  return (
    <div className="flex-1 lg:flex-[2] flex flex-col gap-6">
      {/* Detail Card */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-light dark:border-border-dark pb-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Functions className="size-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                  Mid-Term Mathematics
                </h3>
                <div className="flex items-center gap-3 text-sm text-text-sec-light dark:text-text-sec-dark mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarToday className="size-4" />
                    Oct 12, 2023
                  </span>
                  <span className="flex items-center gap-1">
                    <Schedule className="size-4" />
                    90 Mins
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-400">
                Completed
              </span>
              <div className="text-3xl font-black text-primary">92%</div>
            </div>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceComparison />
            
            {/* Strengths & Weaknesses */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-text-sec-light dark:text-text-sec-dark">
                Detailed Analysis
              </h4>
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl bg-green-50 dark:bg-green-900/10 p-3">
                  <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
                    <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                    <span className="text-sm font-bold">Strengths</span>
                  </div>
                  <ul className="list-none space-y-1 text-sm text-text-main-light dark:text-text-main-dark">
                    <li className="flex items-start gap-2 text-xs font-medium">
                      <span className="block size-1.5 mt-1.5 rounded-full bg-green-500"></span>
                      Geometry
                    </li>
                    <li className="flex items-start gap-2 text-xs font-medium">
                      <span className="block size-1.5 mt-1.5 rounded-full bg-green-500"></span>
                      Algebra II
                    </li>
                  </ul>
                </div>
                <div className="flex-1 rounded-xl bg-red-50 dark:bg-red-900/10 p-3">
                  <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-400">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span className="text-sm font-bold">Weaknesses</span>
                  </div>
                  <ul className="list-none space-y-1 text-sm text-text-main-light dark:text-text-main-dark">
                    <li className="flex items-start gap-2 text-xs font-medium">
                      <span className="block size-1.5 mt-1.5 rounded-full bg-red-500"></span>
                      Calculus
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Suggestion */}
          <div className="relative overflow-hidden rounded-xl bg-primary/5 p-4 border border-primary/10">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Lightbulb className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                  Suggestion for Improvement
                </h4>
                <p className="text-sm text-text-sec-light dark:text-text-sec-dark mt-1">
                  Review quadratic equations in Calculus. Practice sets 4 & 5 are recommended before the finals.
                </p>
              </div>
            </div>
          </div>

          <QuestionBreakdown />

          {/* View Full Report */}
          <div className="flex justify-end pt-2">
            <button className="text-sm font-medium text-text-sec-light dark:text-text-sec-dark hover:text-primary flex items-center gap-1 transition-colors">
              View Full Report
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}