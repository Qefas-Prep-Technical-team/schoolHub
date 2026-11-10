"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Download, FileText, BarChart3 } from 'lucide-react'
import { ExamDetailData } from './types'
import { ParentExamDetailExportModal } from './export/ParentExamDetailExportModal'

interface ParentToolsProps {
  data: ExamDetailData
}

export default function ParentTools({ data }: ParentToolsProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const handleExportPDF = () => {
    setIsExportModalOpen(true)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-400 block mb-3">
        Parent Actions
      </span>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Download size={15} />
          <span>Export Examination Review</span>
        </button>

        <Link
          href={`/dashboard/parent/exams&results/report-card?childId=${data.studentId}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all"
        >
          <FileText size={15} />
          <span>Full Term Report Card</span>
        </Link>

        <Link
          href="/dashboard/parent/attendance"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-orange-600 rounded-xl text-xs sm:text-sm font-bold transition-all"
        >
          <BarChart3 size={15} />
          <span>Attendance & Record</span>
        </Link>
      </div>

      {/* Multi-format Examination Review Export Modal */}
      <ParentExamDetailExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
      />
    </div>
  )
}
