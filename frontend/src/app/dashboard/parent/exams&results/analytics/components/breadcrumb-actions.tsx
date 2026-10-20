"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Download, User } from 'lucide-react'
import { ChildSummary } from '@/lib/api/services/parentService'

interface BreadcrumbActionsProps {
  subjectName: string
  studentId: string
  childrenList: ChildSummary[]
  selectedChildId: string
  onSelectChild: (id: string) => void
}

export default function BreadcrumbActions({
  subjectName,
  studentId,
  childrenList,
  selectedChildId,
  onSelectChild,
}: BreadcrumbActionsProps) {

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap">
        <Link
          href="/dashboard/parent"
          className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
        >
          Dashboard
        </Link>
        <ChevronRight size={14} className="text-slate-400 shrink-0" />
        <Link
          href="/dashboard/parent/exams&results"
          className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
        >
          Exams & Results
        </Link>
        <ChevronRight size={14} className="text-slate-400 shrink-0" />
        <span className="text-slate-900 dark:text-white font-bold truncate max-w-[180px] sm:max-w-none">
          {subjectName} Analytics
        </span>
      </nav>

      {/* Right Controls: Child Switcher & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {childrenList.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-1.5 flex items-center shadow-xs">
            <div className="flex items-center gap-1.5 px-2 text-slate-400">
              <User size={14} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Student
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <select
              value={selectedChildId}
              onChange={(e) => onSelectChild(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer py-1 pr-7 pl-2"
            >
              {childrenList.map((child) => (
                <option key={child.id} value={child.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Link
          href={`/dashboard/parent/exams&results/report-card?childId=${studentId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          <Download size={14} />
          <span>Dashboard Report</span>
        </Link>
      </div>
    </div>
  )
}
