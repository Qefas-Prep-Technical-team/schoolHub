"use client"

import React from 'react'
import { ReportCardData } from './types'

interface AcademicTableProps {
  data: ReportCardData
}

export default function AcademicTable({ data }: AcademicTableProps) {
  const subjects = data.subjects || []

  function getGradeBadge(grade: string) {
    const g = grade.toUpperCase()
    if (g.startsWith('A')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20'
    }
    if (g.startsWith('B')) {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-500/20'
    }
    if (g.startsWith('C')) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-500/20'
    }
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-500/20'
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Academic Performance Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise continuous assessment and terminal examination results
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          {subjects.length} Subjects Graded
        </span>
      </div>

      {subjects.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
          No grade entries found for the selected term.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Desktop Tabular View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Subject Title</th>
                  <th className="py-3.5 px-4 text-center">C.A. Score</th>
                  <th className="py-3.5 px-4 text-center">Exam Mark</th>
                  <th className="py-3.5 px-4 text-center">Total (100)</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Academic Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {subjects.map((sub, i) => (
                  <tr
                    key={sub.id || i}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {i + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {sub.name}
                      </span>
                      {sub.teacher && (
                        <span className="text-[11px] text-slate-400">
                          {sub.teacher}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                      {sub.caScore}/{sub.caMax}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                      {sub.examScore}/{sub.examMax}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                      {sub.totalScore}/{sub.totalMax}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({sub.percentage}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md font-black text-xs border ${getGradeBadge(sub.grade)}`}>
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {sub.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {subjects.map((sub, i) => (
              <div key={sub.id || i} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </h4>
                      {sub.teacher && (
                        <p className="text-[11px] text-slate-400">{sub.teacher}</p>
                      )}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${getGradeBadge(sub.grade)}`}>
                    Grade {sub.grade}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">C.A.</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{sub.caScore}/{sub.caMax}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exam</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{sub.examScore}/{sub.examMax}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="font-black text-slate-900 dark:text-white">{sub.percentage}%</span>
                  </div>
                </div>

                {sub.remark && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    &ldquo;{sub.remark}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
