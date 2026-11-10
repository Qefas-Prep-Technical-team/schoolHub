"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Download, User, Calendar, ArrowLeft, RotateCw } from 'lucide-react'
import { ChildSummary } from '@/lib/api/services/parentService'
import { ReportCardData } from './types'
import { ParentReportCardExportModal } from './ParentReportCardExportModal'

interface BreadcrumbActionsProps {
  data: ReportCardData
  childrenList: ChildSummary[]
  selectedChildId: string
  selectedTerm: string
  onSelectChild: (id: string) => void
  onSelectTerm: (term: string) => void
}

export default function BreadcrumbActions({
  data,
  childrenList,
  selectedChildId,
  selectedTerm,
  onSelectChild,
  onSelectTerm,
}: BreadcrumbActionsProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)
  const termOptions = ['All Terms', 'Term 1', 'Term 2', 'Term 3']

  const handleDownloadPDF = () => {
    setIsExportModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 print:hidden">
      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
          <span className="text-slate-900 dark:text-white font-bold">
            Activity Report Card
          </span>
        </nav>

        {/* Back Button to Final Results */}
        <Link
          href="/dashboard/parent/exams&results"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Results</span>
        </Link>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
        {/* Selectors: Child & Term */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {childrenList.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1.5 flex items-center shadow-xs">
              <div className="flex items-center gap-1.5 px-2 text-slate-400">
                <User size={14} className="text-orange-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Student
                </span>
              </div>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
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

          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1.5 flex items-center shadow-xs">
            <div className="flex items-center gap-1.5 px-2 text-slate-400">
              <Calendar size={14} className="text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Term
              </span>
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <select
              value={selectedTerm}
              onChange={(e) => onSelectTerm(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer py-1 pr-7 pl-2"
            >
              {termOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Button: PDF Export / Dossier Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download size={15} />
            <span>Export Report Card</span>
          </button>
        </div>
      </div>

      {/* Multi-Format Academic Export Modal */}
      <ParentReportCardExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
      />
    </div>
  )
}
