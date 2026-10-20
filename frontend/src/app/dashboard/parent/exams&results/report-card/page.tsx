"use client"

import React, { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, RefreshCw, FileText, Download, AlertCircle, ArrowRight, Info } from 'lucide-react'
import BreadcrumbActions from './components/breadcrumb-actions'
import ReportHeader from './components/report-header'
import StudentInfo from './components/student-info'
import AcademicTable from './components/academic-table'
import RemarksSection from './components/remarks-section'
import ReportFooter from './components/footer'
import { ReportCardData, ReportSubjectGrade } from './components/types'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useParentChildren, useChildDetails } from '@/lib/api/hooks/useParentChildren'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useSchoolProfile } from '@/lib/api/hooks/useSchool'

function gradeLabel(percentage: number): string {
  if (percentage >= 75) return 'A1'
  if (percentage >= 70) return 'B2'
  if (percentage >= 65) return 'B3'
  if (percentage >= 50) return 'C6'
  if (percentage >= 40) return 'D7'
  return 'F9'
}

function standingLabel(percentage: number): string {
  if (percentage >= 75) return 'Distinction'
  if (percentage >= 70) return 'Very Good'
  if (percentage >= 65) return 'Good Standing'
  if (percentage >= 50) return 'Credit'
  if (percentage >= 40) return 'Pass'
  return 'Academic Support Recommended'
}

// ==========================================
// Shimmering Comprehensive Loading Skeleton (98% fit)
// ==========================================
function ReportCardSkeleton() {
  return (
    <div className="w-full max-w-[98%] mx-auto flex flex-col gap-5 p-2 sm:p-4 lg:p-5 animate-pulse">
      {/* Top Nav Breadcrumbs Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Action Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Report Card Document Skeleton */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative">
        {/* Top Decorative Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500/40 via-amber-500/40 to-orange-600/40" />

        {/* Header Skeleton */}
        <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-5">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-60 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-44 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/40 rounded" />
            </div>
          </div>
          <div className="h-16 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Student Info & KPI Cards Skeleton */}
        <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4 space-y-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Academic Table Skeleton */}
        <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Remarks & Domain Skeleton */}
        <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
            <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
            <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="p-6 text-center space-y-2">
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
          <div className="h-3 w-96 bg-slate-100 dark:bg-slate-800/50 rounded mx-auto" />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Inner Report Card Content Component
// ==========================================
function TermReportContent() {
  const searchParams = useSearchParams()
  const childIdParam = searchParams.get('childId')
  const initialTerm = searchParams.get('term') || 'All Terms'

  const { selectedChildId, setSelectedChildId } = useParentStore()
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren()

  // Resolve active child ID
  const effectiveChildId = useMemo(() => {
    if (childIdParam && children.some((c) => c.id === childIdParam)) {
      return childIdParam
    }
    if (selectedChildId && children.some((c) => c.id === selectedChildId)) {
      return selectedChildId
    }
    return children[0]?.id || ''
  }, [childIdParam, selectedChildId, children])

  const currentChildSummary = useMemo(() => {
    return children.find((c) => c.id === effectiveChildId) || children[0]
  }, [children, effectiveChildId])

  const { 
    data: childDetails, 
    isLoading: isDetailsLoading, 
    refetch: refetchDetails 
  } = useChildDetails(effectiveChildId || null)

  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading 
  } = useParentDashboard(effectiveChildId || null)

  const schoolId = currentChildSummary?.school?.id || (childDetails?.school as { id?: string } | undefined)?.id || ''
  const { data: schoolProfile } = useSchoolProfile(schoolId)

  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm)

  // Primary loading guard
  const isInitialLoading = isChildrenLoading || isDetailsLoading

  // Filter grades by selected term
  const filteredGrades = useMemo(() => {
    const raw = childDetails?.grades || []
    if (selectedTerm === 'All Terms') return raw
    return raw.filter((g) => {
      const termStr = `${g.term || ''} ${g.assessmentType || ''}`.toLowerCase()
      return termStr.includes(selectedTerm.toLowerCase().replace('term ', 'term'))
    })
  }, [childDetails?.grades, selectedTerm])

  // Synthesize Report Card Model
  const reportData = useMemo<ReportCardData | null>(() => {
    if (isInitialLoading || !childDetails) return null

    const rawGrades = filteredGrades.length > 0 ? filteredGrades : (childDetails?.grades || [])

    // Group grades by subject to compute combined C.A. + Exam marks
    const subjectMap: { 
      [name: string]: { 
        caScore: number; 
        caMax: number; 
        examScore: number; 
        examMax: number; 
        totalScore: number; 
        totalMax: number; 
        teacher?: string; 
        remarks?: string;
      } 
    } = {}

    for (const g of rawGrades) {
      const subName = g.subject || g.subjectPaper?.subject?.name || g.subjectPaper?.title || 'Subject'
      if (!subjectMap[subName]) {
        subjectMap[subName] = {
          caScore: 0,
          caMax: 0,
          examScore: 0,
          examMax: 0,
          totalScore: 0,
          totalMax: 0,
          teacher: g.teacher?.name || g.subjectPaper?.teacher?.name,
          remarks: g.remarks
        }
      }

      const score = Math.round(Number(g.score) || 0)
      const maxMarks = Math.max(1, Math.round(Number(g.maxMarks) || 100))
      const type = (g.assessmentType || '').toUpperCase()

      // If tagged as test / quiz / homework, classify into C.A., otherwise Terminal Exam
      if (type.includes('TEST') || type.includes('QUIZ') || type.includes('HOMEWORK') || type.includes('CA')) {
        subjectMap[subName].caScore += score
        subjectMap[subName].caMax += maxMarks
      } else {
        subjectMap[subName].examScore += score
        subjectMap[subName].examMax += maxMarks
      }

      subjectMap[subName].totalScore += score
      subjectMap[subName].totalMax += maxMarks
      if (g.remarks && !subjectMap[subName].remarks) {
        subjectMap[subName].remarks = g.remarks
      }
    }

    // Convert map to subject list
    const subjects: ReportSubjectGrade[] = Object.keys(subjectMap).map((name, i) => {
      const item = subjectMap[name]
      const percentage = item.totalMax > 0 ? Math.round((item.totalScore / item.totalMax) * 100) : 0
      const grade = gradeLabel(percentage)

      // Fallback distribution if only exam or only CA was recorded
      let caS = item.caScore
      let caM = item.caMax
      let exS = item.examScore
      let exM = item.examMax

      if (caM === 0 && exM > 0) {
        caM = 40
        caS = Math.round((percentage * 40) / 100)
        exM = 60
        exS = Math.round((percentage * 60) / 100)
      } else if (exM === 0 && caM > 0) {
        caM = 40
        caS = Math.round((percentage * 40) / 100)
        exM = 60
        exS = Math.round((percentage * 60) / 100)
      }

      return {
        id: `sub-${i}-${name}`,
        name,
        caScore: caS,
        caMax: caM || 40,
        examScore: exS,
        examMax: exM || 60,
        totalScore: Math.round(caS + exS),
        totalMax: 100,
        percentage,
        grade,
        remark: item.remarks || (percentage >= 75 ? 'Exceptional academic competence demonstrated' : percentage >= 50 ? 'Satisfactory conceptual grasp' : 'Extra revision recommended'),
        teacher: item.teacher
      }
    })

    // Compute cumulative aggregates
    const overallTotal = subjects.reduce((sum, s) => sum + s.percentage, 0)
    const averageScore = subjects.length > 0 ? Math.round(overallTotal / subjects.length) : 0
    const overallGrade = gradeLabel(averageScore)
    const standing = standingLabel(averageScore)

    const attendanceRate = dashboardData?.stats?.attendanceRate ?? 95

    let dateFormatted = 'Session Concluded'
    try {
      dateFormatted = format(new Date(), 'MMMM dd, yyyy')
    } catch {
      dateFormatted = 'Current Session'
    }

    return {
      studentId: effectiveChildId,
      studentName: childDetails?.name || currentChildSummary?.name || 'Student',
      studentCode: childDetails?.studentCode || currentChildSummary?.studentCode || 'N/A',
      studentImage: childDetails?.profileImage || currentChildSummary?.profileImage,
      currentClass: childDetails?.classes?.[0]?.class?.name || currentChildSummary?.currentClass?.name || 'Standard Division',
      schoolName: schoolProfile?.name || childDetails?.school?.name || currentChildSummary?.school?.name || 'Qefas Academic Institution',
      schoolAddress: schoolProfile?.address || 'Institutional Campus • Primary & Secondary Division',
      schoolEmail: schoolProfile?.contactEmail || schoolProfile?.email || 'academics@qefas.edu',
      schoolPhone: schoolProfile?.contactPhone || schoolProfile?.phone || '',
      schoolLogo: schoolProfile?.logo || (childDetails?.school as { logo?: string } | undefined)?.logo || '/schoolhub.png',
      term: selectedTerm === 'All Terms' ? 'Cumulative Term Evaluation' : selectedTerm,
      session: '2026/2027 Academic Session',
      reportType: 'Qefas Hub Activity Report',
      date: dateFormatted,
      averageScore,
      totalSubjects: subjects.length,
      attendanceRate,
      overallGrade,
      standing,
      subjects,
      promotionStatus: averageScore >= 50 ? 'Cleared for Class Advancement' : 'Conditional Advancement Under Review',
      schoolProfile: schoolProfile ? {
        id: schoolProfile.id,
        name: schoolProfile.name,
        plan: schoolProfile.plan,
        subscriptionStatus: schoolProfile.subscriptionStatus,
        isTrialActive: schoolProfile.isTrialActive,
        subscriptionEnd: schoolProfile.subscriptionEnd,
        logo: schoolProfile.logo || schoolProfile.schoolLogo,
        address: schoolProfile.address,
        email: schoolProfile.contactEmail || schoolProfile.email,
        phone: schoolProfile.contactPhone || schoolProfile.phone,
      } : (childDetails?.school ? {
        name: childDetails.school.name,
        plan: childDetails.school.plan,
        subscriptionStatus: childDetails.school.subscriptionStatus,
        isTrialActive: childDetails.school.isTrialActive,
        subscriptionEnd: childDetails.school.subscriptionEnd,
        logo: childDetails.school.logo,
        address: childDetails.school.address,
        email: childDetails.school.schoolEmail,
        phone: childDetails.school.phone,
      } : (currentChildSummary?.school ? {
        id: currentChildSummary.school.id,
        name: currentChildSummary.school.name,
        plan: currentChildSummary.school.plan,
        subscriptionStatus: currentChildSummary.school.subscriptionStatus,
        isTrialActive: currentChildSummary.school.isTrialActive,
      } : undefined))
    }
  }, [isInitialLoading, childDetails, currentChildSummary, filteredGrades, selectedTerm, dashboardData, effectiveChildId, schoolProfile])

  // Direct loading rendering (prevents empty state flash while queries are resolving)
  if (isInitialLoading) {
    return <ReportCardSkeleton />
  }

  // True empty state when data has finished loading and student genuinely has 0 grades
  if (!reportData || reportData.subjects.length === 0) {
    return (
      <div className="w-full max-w-[98%] mx-auto p-4 sm:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center">
          <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 shadow-xs">
            <FileText size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            No Report Card Records Posted Yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
            Examination grades and terminal assessment scores for <span className="font-bold text-slate-800 dark:text-white">{currentChildSummary?.name || 'this student'}</span> will compile into an official report card here once published by the academic committee.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => refetchDetails()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              <RefreshCw size={14} />
              <span>Check for Updates</span>
            </button>
            <Link
              href="/dashboard/parent/exams&results"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Back to Exams & Results</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="w-full max-w-[98%] mx-auto p-2 sm:p-4 lg:p-5 space-y-5 sm:space-y-6">
      {/* 1. Breadcrumbs, Child Switcher, Term Selector & Action Buttons */}
      <BreadcrumbActions
        data={reportData}
        childrenList={children}
        selectedChildId={effectiveChildId}
        selectedTerm={selectedTerm}
        onSelectChild={(id) => setSelectedChildId(id)}
        onSelectTerm={(term) => setSelectedTerm(term)}
      />

      {/* Notice Banner: Interim Activity Report Disclosure */}
      <div className="w-full bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Interim Student Activity Report
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                Continuous Learning Record
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed max-w-3xl">
              This report compiles the student&apos;s continuous assessment scores, homework, and learning activities recorded on <strong className="font-semibold text-amber-950 dark:text-amber-100">Qefas Hub</strong>. It is <strong>not</strong> the final official school report card. The official final terminal school report card issued by the school administration appears on the <strong className="font-semibold text-amber-950 dark:text-amber-100">Final Results</strong> page.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/parent/exams&results"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 shadow-xs"
        >
          <span>View Final Results</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 2. Official Printable Report Card Document (Fits 98% of Available Space) */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative print:shadow-none print:border-none print:rounded-none">
        <ReportHeader data={reportData} />
        <StudentInfo data={reportData} />
        <AcademicTable data={reportData} />
        <RemarksSection data={reportData} />
        <ReportFooter />
      </div>
    </main>
  )
}

export default function TermReportPage() {
  return (
    <Suspense fallback={<ReportCardSkeleton />}>
      <TermReportContent />
    </Suspense>
  )
}
