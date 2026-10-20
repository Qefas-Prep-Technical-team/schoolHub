"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Download, User, Calendar, ArrowLeft, RotateCw } from 'lucide-react'
import { ChildSummary } from '@/lib/api/services/parentService'
import { ReportCardData } from './types'
import { generatePDF } from '@/utils/pdfGenerator'
import { toast } from 'react-toastify'
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck'

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
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const termOptions = ['All Terms', 'Term 1', 'Term 2', 'Term 3']

  const handleDownloadPDF = async () => {
    if (isExporting) return

    // Verify school is on a paying plan (plans apart from FREE)
    if (!assertSchoolPayingPlan(data.schoolProfile)) {
      return
    }

    setIsExporting(true)
    const toastId = toast.loading("Generating PDF...", { autoClose: false })

    try {
      const tableHeaders = [
        ['S/N', 'Subject Name', 'C.A. (40)', 'Terminal Exam (60)', 'Total Mark (100)', 'Grade', 'Teacher Remark']
      ]

      const tableData = data.subjects.map((sub, i) => [
        String(i + 1),
        sub.name,
        `${sub.caScore}/${sub.caMax}`,
        `${sub.examScore}/${sub.examMax}`,
        `${sub.totalScore}/${sub.totalMax} (${sub.percentage}%)`,
        sub.grade,
        sub.remark
      ])

      await generatePDF({
        title: `${data.schoolName.toUpperCase()} - STUDENT ACTIVITY & ASSESSMENT REPORT`,
        filename: `${data.studentName.replace(/\s+/g, '_')}_Activity_Report_${data.term.replace(/\s+/g, '_')}.pdf`,
        schoolProfile: {
          name: data.schoolName,
          address: data.schoolAddress,
          email: data.schoolEmail,
          phone: data.schoolPhone,
          logo: data.schoolLogo
        },
        metaData: [
          { label: 'Student Name', value: data.studentName },
          { label: 'Student ID', value: data.studentCode },
          { label: 'Current Class', value: data.currentClass || 'Standard Grade' },
          { label: 'Academic Session', value: data.session },
          { label: 'Evaluation Period', value: data.term },
          { label: 'Document Type', value: 'Qefas Hub Activity Report (Interim)' },
          { label: 'Cumulative Average', value: `${data.averageScore}% (Grade ${data.overallGrade})` },
          { label: 'Attendance Rate', value: `${data.attendanceRate}% Recorded` },
          { label: 'Academic Standing', value: data.standing },
          { label: 'Official Status', value: 'Interim Record • Final School Report Card on Final Results Page' }
        ],
        tableHeaders,
        tableData,
        additionalTables: [
          {
            title: 'Institutional Notice & Platform Disclosure',
            headers: [['Topic', 'Official Declaration']],
            data: [
              [
                'Document Scope',
                'This report reflects all continuous assessment activities, assignments, and test scores logged on Qefas Hub.'
              ],
              [
                'Final School Report Card',
                'This document is NOT the final terminal school report card. The official final terminal school report card endorsed by the school administration appears on the Final Results portal.'
              ],
              [
                'Advancement Recommendation',
                `${data.standing} — ${data.promotionStatus || 'Cleared for Class Advancement'}`
              ]
            ]
          }
        ],
        orientation: 'portrait'
      })

      toast.update(toastId, {
        render: "PDF Exported Successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      })
    } catch (error) {
      console.error('Failed to export PDF:', error)
      toast.update(toastId, {
        render: "Failed to export PDF",
        type: "error",
        isLoading: false,
        autoClose: 3000
      })
    } finally {
      setIsExporting(false)
    }
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

        {/* Button: PDF Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <RotateCw size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            <span>{isExporting ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
