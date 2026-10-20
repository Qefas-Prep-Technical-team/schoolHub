"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, CheckCircle2, FileText, ChevronRight } from 'lucide-react'
import { SubjectAnalyticsData } from './types'
import Pagination from '@/components/ui/Pagination'

interface AssessmentsTableProps {
  data: SubjectAnalyticsData
}

export default function AssessmentsTable({ data }: AssessmentsTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 5

  const assessments = data.assessments || []
  const totalPages = Math.ceil(assessments.length / itemsPerPage) || 1
  const paginatedAssessments = assessments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Evaluated Assessments
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log of continuous assessments, tests and exams
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          {assessments.length} Records
        </span>
      </div>

      {assessments.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
          No assessment entries logged for this selection yet.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3.5">Assessment Details</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-center">Score</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {paginatedAssessments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                        {a.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {a.subject} {a.teacher ? `• ${a.teacher}` : ''}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {a.date}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="font-black text-slate-900 dark:text-white">
                        {a.score}/{a.maxMarks}
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.2 rounded">
                        {a.percentage}% • {a.grade}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/parent/exams&results/details?id=${a.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedAssessments.map((a) => (
              <div key={a.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {a.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.subject} {a.teacher ? `• ${a.teacher}` : ''}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase shrink-0">
                    {a.type}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} />
                    <span>{a.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white">
                      {a.score}/{a.maxMarks}
                    </span>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded">
                      {a.percentage}% ({a.grade})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={12} />
                    {a.status}
                  </span>

                  <Link
                    href={`/dashboard/parent/exams&results/details?id=${a.id}`}
                    className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Examination Dossier</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={assessments.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                theme="orange"
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
