"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Download, FileText, BarChart3, Loader2 } from 'lucide-react'
import { ExamDetailData } from './types'
import { generatePDF } from '@/utils/pdfGenerator'
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck'

interface ParentToolsProps {
  data: ExamDetailData
}

export default function ParentTools({ data }: ParentToolsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!assertSchoolPayingPlan(data.schoolProfile)) {
      return
    }

    try {
      setIsExporting(true)

      const tableHeaders = [
        ['#', 'Subject / Paper', 'Teacher / Faculty', 'Score', 'Max Marks', 'Percentage', 'Remarks']
      ]

      const tableData = data.subjects.length > 0 
        ? data.subjects.map((s, idx) => [
            (idx + 1).toString(),
            s.name,
            s.teacher || '—',
            s.score.toString(),
            s.totalMarks.toString(),
            `${s.percentage}%`,
            s.remarks || '—'
          ])
        : [
            ['1', data.title, 'Subject Faculty', data.score.toString(), data.totalScore.toString(), `${data.percentage}%`, 'Completed Assessment']
          ]

      const additionalTables = (data.questions && data.questions.length > 0) ? [
        {
          title: 'Question Breakdown & Evaluation',
          headers: [['Q#', 'Question / Topic', 'Points', 'Awarded', 'Status']],
          data: data.questions.map(q => [
            q.number.toString(),
            q.title,
            q.points,
            q.scoreAwarded.toString(),
            q.isCorrect === true ? 'CORRECT' : q.isCorrect === false ? 'INCORRECT' : 'REVIEWED'
          ])
        }
      ] : undefined

      await generatePDF({
        title: `${data.title} - Examination Dossier`,
        filename: `${data.studentName.replace(/\s+/g, '_')}_${data.title.replace(/\s+/g, '_')}_Exam_Slip.pdf`,
        schoolProfile: data.schoolProfile,
        metaData: [
          { label: 'Student Name', value: data.studentName },
          { label: 'Student ID', value: data.studentCode },
          { label: 'Class / Grade', value: data.currentClass || 'N/A' },
          { label: 'Assessment Date', value: data.date },
          { label: 'Assessment Title', value: data.title },
          { label: 'Category', value: data.category },
          { label: 'Total Score', value: `${data.score} / ${data.totalScore}` },
          { label: 'Percentage', value: `${data.percentage}%` },
          { label: 'Grade Awarded', value: data.grade },
          { label: 'Proficiency Standing', value: data.proficiency || 'N/A' },
        ],
        tableHeaders,
        tableData,
        additionalTables,
        orientation: 'portrait',
      })
    } finally {
      setIsExporting(false)
    }
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
          disabled={isExporting}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          <span>Export Official PDF</span>
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
    </div>
  )
}
