"use client"

import React, { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, AlertCircle, FileSearch, RefreshCw } from 'lucide-react'
import PageHeader from './components/page-header'
import KPICards from './components/kpi-cards'
import PerformanceBreakdown from './components/performance-breakdown'
import QuestionReview from './components/question-review'
import ParentTools from './components/parent-tools'
import StrengthsWeaknesses from './components/strengths-weaknesses'
import TeacherNote from './components/teacher-note'
import { ExamDetailData, ExamSubjectDetail, ExamQuestionDetail } from './components/types'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useParentChildren, useChildDetails } from '@/lib/api/hooks/useParentChildren'
import { useExamResult, useExamReview } from '@/lib/api/hooks/useExams'

function gradeLabel(percentage: number): string {
  if (percentage >= 75) return 'A1'
  if (percentage >= 70) return 'B2'
  if (percentage >= 65) return 'B3'
  if (percentage >= 50) return 'C6'
  if (percentage >= 40) return 'D7'
  return 'F9'
}

function proficiencyLabel(percentage: number): string {
  if (percentage >= 75) return 'Distinction'
  if (percentage >= 70) return 'Very Good'
  if (percentage >= 65) return 'Good'
  if (percentage >= 50) return 'Credit'
  if (percentage >= 40) return 'Pass'
  return 'Needs Support'
}

// ==========================================
// Loading Skeleton
// ==========================================
function ExamDetailsSkeleton() {
  return (
    <div className="w-full max-w-[99%] mx-auto flex flex-col gap-5 p-3 sm:p-5 lg:p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="space-y-6">
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-60 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Inner Details Component
// ==========================================
function ExamDetailsContent() {
  const searchParams = useSearchParams()
  const examId = searchParams.get('id') || ''

  const { selectedChildId, setSelectedChildId } = useParentStore()
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren()

  // Resolve active child ID
  const effectiveChildId = useMemo(() => {
    if (selectedChildId && children.some(c => c.id === selectedChildId)) {
      return selectedChildId
    }
    return children[0]?.id || ''
  }, [selectedChildId, children])

  const currentChildSummary = useMemo(() => {
    return children.find(c => c.id === effectiveChildId) || children[0]
  }, [children, effectiveChildId])

  // Queries
  const { 
    data: childDetails, 
    isLoading: isDetailsLoading, 
    refetch: refetchChildDetails 
  } = useChildDetails(effectiveChildId || null)

  const { 
    data: examResult, 
    isLoading: isResultLoading 
  } = useExamResult(examId, effectiveChildId || undefined)

  const { 
    data: examReview, 
    isLoading: isReviewLoading 
  } = useExamReview(examId, effectiveChildId || undefined)

  // Find all matching grades for this exam or grade ID
  const matchingGrades = useMemo(() => {
    const grades = childDetails?.grades || []
    if (!examId) return grades
    return grades.filter((g: any) => 
      g.examId === examId || 
      g.id === examId || 
      g.exam?.id === examId ||
      g.subjectPaperId === examId
    )
  }, [childDetails?.grades, examId])

  // Construct synthesized exam detail model
  const detailData = useMemo<ExamDetailData | null>(() => {
    // If we have neither matching grades nor examResult nor examReview, and not loading, we can't synthesize
    if (matchingGrades.length === 0 && !examResult && !examReview) {
      return null
    }

    const firstGrade = matchingGrades[0]

    // 1. Title Resolution
    let title = examResult?.examTitle || firstGrade?.exam?.title
    if (!title && firstGrade) {
      title = `${firstGrade.subject || 'Assessment'} ${firstGrade.assessmentType || 'Paper'}`
    }
    if (!title && examReview?.subjects?.[0]?.subjectName) {
      title = `${examReview.subjects[0].subjectName} Examination`
    }
    if (!title) {
      title = 'Academic Examination Dossier'
    }

    // 2. Scores
    let score = 0
    let totalScore = 0

    if (examResult && typeof examResult.totalScore === 'number') {
      score = Math.round(examResult.totalScore)
      totalScore = Math.max(1, Math.round(examResult.totalMarks || 100))
    } else if (matchingGrades.length > 0) {
      score = Math.round(matchingGrades.reduce((sum: number, g: any) => sum + (Number(g.score) || 0), 0))
      totalScore = Math.max(1, Math.round(matchingGrades.reduce((sum: number, g: any) => sum + (Number(g.maxMarks) || 0), 0)))
    } else if (examReview && typeof examReview.totalScore === 'number') {
      score = Math.round(examReview.totalScore)
      totalScore = Math.max(1, Math.round(examReview.totalMarks || 100))
    } else {
      score = 0
      totalScore = 100
    }

    const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    const grade = examResult?.grade || gradeLabel(percentage)
    const proficiency = examResult?.proficiency || proficiencyLabel(percentage)

    // 3. Subjects list
    let subjects: ExamSubjectDetail[] = []
    if (examResult?.subjectBreakdown && Array.isArray(examResult.subjectBreakdown) && examResult.subjectBreakdown.length > 0) {
      subjects = examResult.subjectBreakdown.map((sb: any) => ({
        id: sb.subjectPaperId || sb.subjectName,
        name: sb.subjectName || 'Subject',
        score: Math.round(sb.score || 0),
        totalMarks: Math.max(1, Math.round(sb.totalMarks || 100)),
        percentage: Math.round(sb.percentage ?? ((sb.score / (sb.totalMarks || 1)) * 100)),
        teacher: 'Subject Faculty',
        remarks: sb.isPassed ? 'Satisfactory mastery demonstrated' : 'Requires further reinforcement'
      }))
    } else if (matchingGrades.length > 0) {
      subjects = matchingGrades.map((g: any) => {
        const subName = g.subject || g.subjectPaper?.subject?.name || g.subjectPaper?.title || 'Subject'
        const gScore = Math.round(Number(g.score) || 0)
        const gMax = Math.max(1, Math.round(Number(g.maxMarks) || 100))
        const gPct = Math.round((gScore / gMax) * 100)
        return {
          id: g.id,
          name: subName,
          score: gScore,
          totalMarks: gMax,
          percentage: gPct,
          teacher: g.teacher?.name || g.subjectPaper?.teacher?.name || 'Subject Teacher',
          remarks: g.remarks || (gPct >= 70 ? 'Excellent performance in this paper' : 'Continuous practice encouraged')
        }
      })
    } else if (examReview?.subjects && Array.isArray(examReview.subjects)) {
      subjects = examReview.subjects.map((sub: any) => ({
        id: sub.subjectPaperId || sub.subjectName,
        name: sub.subjectName || 'Subject',
        score: Math.round(sub.score || 0),
        totalMarks: Math.max(1, Math.round(sub.totalMarks || 100)),
        percentage: Math.round((sub.score / (sub.totalMarks || 1)) * 100),
        teacher: 'Subject Teacher',
        remarks: 'Assessed through digital question evaluation'
      }))
    }

    // 4. Questions
    const questions: ExamQuestionDetail[] = []
    if (examReview?.subjects && Array.isArray(examReview.subjects)) {
      for (const sub of examReview.subjects) {
        let qIndex = 1
        if (Array.isArray(sub.questions)) {
          for (const q of sub.questions) {
            questions.push({
              id: q.questionId || `q-${sub.subjectPaperId || sub.subjectName}-${qIndex}`,
              subjectPaperId: sub.subjectPaperId,
              subjectName: sub.subjectName,
              paperTitle: sub.subjectName,
              number: qIndex++,
              title: q.question || 'Exam Question',
              points: `${q.scoreAwarded ?? 0}/${q.maxMarks ?? 1} pts`,
              scoreAwarded: q.scoreAwarded ?? 0,
              maxMarks: q.maxMarks ?? 1,
              isCorrect: q.isCorrect,
              userAnswer: q.studentAnswer || undefined,
              correctAnswer: q.correctAnswer || undefined,
              explanation: q.explanation || undefined,
              reviewNote: q.reviewNote || undefined
            })
          }
        }
      }
    }

    // 5. Strengths & Weaknesses
    const strengths: string[] = subjects
      .filter(s => s.percentage >= 70)
      .map(s => `${s.name} (${s.percentage}%)`)

    const weaknesses = subjects
      .filter(s => s.percentage < 65)
      .map(s => ({
        name: s.name,
        description: `Scored ${s.percentage}% (${s.score}/${s.totalMarks}) - review core concepts`
      }))

    // 6. Teacher Note
    const firstRemark = matchingGrades.find((g: any) => g.remarks)?.remarks
    const teacherName = firstGrade?.teacher?.name || firstGrade?.subjectPaper?.teacher?.name || 'Subject Faculty'
    const teacherNote = firstRemark ? {
      teacherName,
      subject: firstGrade?.subject || 'Class Teacher',
      note: firstRemark
    } : (examResult?.performanceInsight ? {
      teacherName: 'Academic Assessment System',
      subject: 'Performance Insights',
      note: examResult.performanceInsight
    } : undefined)

    // 7. Date string
    let dateStr = 'Recently Graded'
    const rawDate = firstGrade?.createdAt || examReview?.submittedAt
    if (rawDate) {
      try {
        dateStr = format(new Date(rawDate), 'MMM dd, yyyy')
      } catch {
        dateStr = 'Recently Graded'
      }
    }

    return {
      id: examId || firstGrade?.id || 'exam-details',
      title,
      category: firstGrade?.assessmentType || 'EXAM',
      date: dateStr,
      term: firstGrade?.term || undefined,
      session: firstGrade?.session?.name || undefined,
      studentId: effectiveChildId,
      studentName: childDetails?.name || currentChildSummary?.name || 'Student',
      studentCode: childDetails?.studentCode || currentChildSummary?.studentCode || 'N/A',
      studentImage: childDetails?.profileImage || currentChildSummary?.profileImage,
      currentClass: childDetails?.classes?.[0]?.class?.name || currentChildSummary?.currentClass?.name,
      schoolName: childDetails?.school?.name || currentChildSummary?.school?.name,
      schoolProfile: (childDetails?.school || currentChildSummary?.school) as Record<string, unknown> | undefined,
      score,
      totalScore,
      percentage,
      grade,
      proficiency,
      classAverage: examResult?.classAverage ? Math.round(examResult.classAverage) : undefined,
      position: examResult?.position ? `${examResult.position}` : undefined,
      globalStanding: examResult?.globalStanding ?? undefined,
      velocity: examResult?.velocity ?? undefined,
      papersCount: subjects.length > 0 ? subjects.length : 1,
      subjects,
      questions,
      strengths,
      weaknesses,
      teacherNote
    }
  }, [matchingGrades, examResult, examReview, examId, effectiveChildId, childDetails, currentChildSummary])

  const isLoading = isChildrenLoading || isDetailsLoading || isResultLoading || isReviewLoading

  if (isLoading && !detailData) {
    return <ExamDetailsSkeleton />
  }

  // Not Found State
  if (!detailData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center">
          <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 shadow-xs">
            <FileSearch size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Assessment Record Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
            We could not find an examination or assessment record matching ID <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-orange-600 font-mono text-xs">{examId || 'empty'}</code> under <span className="font-bold text-slate-800 dark:text-white">{currentChildSummary?.name || 'this student'}</span>&apos;s academic records.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => refetchChildDetails()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              <RefreshCw size={14} />
              <span>Retry Search</span>
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
    <main className="flex-1 flex flex-col overflow-x-hidden relative">
      <div className="flex-1 w-full max-w-[99%] mx-auto p-3 sm:p-5 lg:p-6 space-y-5 sm:space-y-6">
        {/* 1. Header with back button, breadcrumb, title, and child switcher */}
        <PageHeader
          data={detailData}
          childrenList={children}
          selectedChildId={effectiveChildId}
          onSelectChild={(id) => setSelectedChildId(id)}
        />

        {/* 2. 4 KPI Metrics */}
        <KPICards data={detailData} />

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
          {/* Left Column: Performance & Questions */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <PerformanceBreakdown data={detailData} />
            <QuestionReview data={detailData} />
          </div>

          {/* Right Column: Actions, Insights & Teacher Endorsement */}
          <div className="space-y-5 sm:space-y-6">
            <ParentTools data={detailData} />
            <StrengthsWeaknesses data={detailData} />
            <TeacherNote data={detailData} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ExamDetailsPage() {
  return (
    <Suspense fallback={<ExamDetailsSkeleton />}>
      <ExamDetailsContent />
    </Suspense>
  )
}
