"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParentDashboard, UpcomingExam } from '@/lib/api/hooks/useParentDashboard'
import { useChildExams } from '@/lib/api/hooks/useChildExams'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip'
import { Grade } from '@/lib/api/services/parentService'
import { 
  LayoutGrid, 
  List, 
  Search, 
  X, 
  ClipboardCheck, 
  SearchX, 
  ArrowRight, 
  Lock, 
  Lightbulb,
  RotateCw,
  RotateCcw,
  BookOpen,
  ChevronDown,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'

interface Exam {
  id: string
  examId?: string
  title: string
  subject: string
  teacher: string
  date: string
  score: number | null
  totalScore: number
  grade: string | null
  percentage?: number
  classAverage: number
  status: 'completed' | 'pending' | 'missed'
  accentColor: string
  icon: string
  iconBgColor: string
  iconColor: string
  assessmentType: string
  papersCount?: number
}

export default function ExamList() {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedTerm, setSelectedTerm] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXAM' | 'CA' | 'ASSIGNMENT' | 'TEST/QUIZ'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const { selectedChildId } = useParentStore()
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useParentDashboard(selectedChildId)
  const { data: childDetails, isLoading: isDetailsLoading, refetch: refetchDetails } = useChildExams(selectedChildId)

  const isLoading = isDashboardLoading || isDetailsLoading

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedSubject, selectedTerm, selectedStatus, activeTab])

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 gap-4 sm:gap-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
        </div>
      </div>
    )
  }

  // 1. Group completed grades strictly by Main Exam (not individual subject papers)
  const examGroups = new Map<string, {
    examId: string
    title: string
    subjects: Set<string>
    teachers: Set<string>
    latestDate: Date
    totalScore: number
    totalMaxMarks: number
    assessmentType: string
    papersCount: number
  }>()

  const standaloneAssessments: Exam[] = []

  ;(childDetails?.grades || []).forEach((grade: Grade) => {
    const mainExamId = grade.examId || grade.exam?.id
    const mainExamTitle = grade.exam?.title?.trim()

    if (mainExamId && mainExamTitle) {
      if (!examGroups.has(mainExamId)) {
        examGroups.set(mainExamId, {
          examId: mainExamId,
          title: mainExamTitle,
          subjects: new Set(),
          teachers: new Set(),
          latestDate: new Date(grade.createdAt),
          totalScore: 0,
          totalMaxMarks: 0,
          assessmentType: grade.assessmentType || grade.category || 'EXAM',
          papersCount: 0,
        })
      }

      const grp = examGroups.get(mainExamId)!
      const sub = grade.subject || grade.subjectPaper?.subject?.name
      if (sub) grp.subjects.add(sub)
      const teacher = grade.subjectPaper?.teacher?.name
      if (teacher && teacher !== 'School Teacher') grp.teachers.add(teacher)

      const gradeDate = new Date(grade.createdAt)
      if (gradeDate > grp.latestDate) grp.latestDate = gradeDate

      grp.totalScore += Number(grade.score || 0)
      grp.totalMaxMarks += Number(grade.maxMarks || 100)
      grp.papersCount += 1
    } else {
      // Standalone assessment without explicit examId: display with proper examination/assessment title (not raw paper title)
      const sub = grade.subject || grade.subjectPaper?.subject?.name || 'General'
      const rawTitle = grade.subjectPaper?.title || ''
      const cleanTitle = (rawTitle && !rawTitle.toLowerCase().match(/^paper\s*\d+$/i))
        ? rawTitle
        : `${sub} ${grade.assessmentType || 'Examination'}`

      const pct = grade.maxMarks > 0 ? Math.round((grade.score / grade.maxMarks) * 100) : 0
      standaloneAssessments.push({
        id: grade.id,
        examId: grade.id,
        title: cleanTitle,
        subject: sub,
        teacher: grade.subjectPaper?.teacher?.name || 'Subject Teacher',
        date: format(new Date(grade.createdAt), 'MMM dd'),
        score: grade.score,
        totalScore: grade.maxMarks,
        grade: gradeLabel(pct),
        percentage: pct,
        classAverage: 75,
        status: 'completed',
        accentColor: 'bg-green-500',
        icon: 'grade',
        iconBgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        assessmentType: grade.assessmentType || grade.category || 'EXAM',
        papersCount: 1,
      })
    }
  })

  // Convert grouped main exams
  const completedMainExams: Exam[] = Array.from(examGroups.values()).map((grp) => {
    const avgPct = grp.totalMaxMarks > 0 ? Math.round((grp.totalScore / grp.totalMaxMarks) * 100) : 0
    const subjectList = Array.from(grp.subjects)
    const subjectDisplay = subjectList.length === 1 
      ? subjectList[0] 
      : subjectList.length > 1 
        ? `${subjectList.length} Subjects (${subjectList.slice(0, 2).join(', ')}${subjectList.length > 2 ? '…' : ''})` 
        : 'Curriculum Subjects'

    const teacherList = Array.from(grp.teachers)
    const teacherDisplay = teacherList.length === 1
      ? teacherList[0]
      : teacherList.length > 1
        ? `${teacherList[0]} +${teacherList.length - 1} more`
        : 'Exam Faculty'

    return {
      id: grp.examId,
      examId: grp.examId,
      title: grp.title,
      subject: subjectDisplay,
      teacher: teacherDisplay,
      date: format(grp.latestDate, 'MMM dd'),
      score: grp.totalScore,
      totalScore: grp.totalMaxMarks,
      percentage: avgPct,
      grade: gradeLabel(avgPct),
      classAverage: 75,
      status: 'completed' as const,
      accentColor: 'bg-green-500',
      icon: 'grade',
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      assessmentType: grp.assessmentType,
      papersCount: grp.papersCount,
    }
  })

  const completedExams = [...completedMainExams, ...standaloneAssessments]

  // Track completed exam IDs and titles to prevent showing completed exams as pending
  const completedExamIds = new Set(completedExams.map(e => e.examId || e.id))
  const completedTitles = new Set(completedExams.map(e => e.title.toLowerCase().trim()))

  // Map Upcoming Main Exams to pending - strictly eligible main exams for this student
  const pendingExams: Exam[] = (dashboardData?.upcomingExams || [])
    .filter((exam: UpcomingExam) => {
      if (completedExamIds.has(exam.id)) return false
      if (exam.title && completedTitles.has(exam.title.toLowerCase().trim())) return false
      return true
    })
    .map((exam: UpcomingExam) => ({
      id: exam.id,
      examId: exam.id,
      title: exam.title,
      subject: exam.subject?.name || 'All Curriculum Subjects',
      teacher: 'Exam Faculty',
      date: exam.startDate ? format(new Date(exam.startDate), 'MMM dd') : 'Scheduled',
      score: null,
      totalScore: 100,
      grade: null,
      classAverage: 0,
      status: 'pending' as const,
      accentColor: 'bg-orange-400',
      icon: 'event',
      iconBgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      assessmentType: exam.category || 'EXAM',
      papersCount: exam.durationMinutes ? Math.max(1, Math.round(exam.durationMinutes / 60)) : 1,
    }))

  const allExams = [...pendingExams, ...completedExams]

  const filteredExams = allExams.filter(exam => {
    const titleMatch = exam.title ? String(exam.title).toLowerCase().includes(search.toLowerCase()) : false
    const subjectMatch = exam.subject ? String(exam.subject).toLowerCase().includes(search.toLowerCase()) : false
    const matchesSearch = titleMatch || subjectMatch
    const matchesSubject = selectedSubject === 'all' || exam.subject.toLowerCase().includes(selectedSubject.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus
    
    let matchesTab = true
    if (activeTab !== 'ALL') {
      const type = exam.assessmentType.toUpperCase()
      if (activeTab === 'TEST/QUIZ') matchesTab = type === 'TEST' || type === 'QUIZ' || type === 'TEST/QUIZ'
      else matchesTab = type === activeTab
    }

    return matchesSearch && matchesSubject && matchesStatus && matchesTab
  })

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage) || 1
  const paginatedExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  function gradeLabel(avg: number) {
    if (avg >= 90) return 'A+'
    if (avg >= 80) return 'A'
    if (avg >= 70) return 'B'
    if (avg >= 60) return 'C'
    if (avg >= 50) return 'D'
    return 'F'
  }

  const getStatusStyles = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20',
          dot: 'bg-emerald-500'
        }
      case 'pending':
        return {
          bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20',
          dot: 'bg-orange-500'
        }
      case 'missed':
        return {
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/20',
          dot: 'bg-red-500'
        }
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedSubject('all')
    setSelectedStatus('all')
    setActiveTab('ALL')
  }

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Streamlined Filter & View Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Section Title & Category Filter Tabs + Grid/List View */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assessments &amp; Exams
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredExams.length}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto no-scrollbar">
            {/* Category Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs shrink-0">
              {(['ALL', 'EXAM', 'CA', 'ASSIGNMENT', 'TEST/QUIZ'] as const).map((tab) => {
                const label = tab === 'ALL' ? 'All' : tab === 'EXAM' ? 'Exams' : tab === 'CA' ? 'C.A.' : tab === 'ASSIGNMENT' ? 'Assignments' : 'Tests'
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      activeTab === tab
                        ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Search Input & Dropdown Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:flex-1 group">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assessment or subject..."
              className="w-full h-10 sm:h-9 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl pl-9 pr-8 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder-slate-400 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Subject Filter Dropdown */}
            <div className="relative flex-1 sm:w-40">
              <BookOpen size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none shrink-0" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full appearance-none h-10 sm:h-9 pl-8 pr-7 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium">All Subjects</option>
                {Array.from(new Set(allExams.map(e => e.subject))).map(sub => (
                  <option key={sub} value={sub.toLowerCase()} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium">{sub}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative flex-1 sm:w-36">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                {selectedStatus === 'completed' ? (
                  <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
                ) : selectedStatus === 'pending' ? (
                  <span className="size-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20 shrink-0" />
                ) : (
                  <Filter size={12} className="text-slate-400 shrink-0" />
                )}
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={cn(
                  "w-full appearance-none h-10 sm:h-9 pl-8 pr-7 text-xs font-bold rounded-xl transition-all outline-none cursor-pointer border",
                  selectedStatus === 'completed'
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
                    : selectedStatus === 'pending'
                    ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 focus:ring-2 focus:ring-amber-500/20"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                )}
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium">All Status</option>
                <option value="completed" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold">Completed</option>
                <option value="pending" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-semibold">Pending</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Filters Action Button */}
            {(selectedStatus !== 'all' || selectedSubject !== 'all' || search !== '') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 sm:h-9 px-2.5 rounded-xl border border-dashed border-orange-300 dark:border-orange-800/60 bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors flex items-center gap-1 text-[11px] font-bold shrink-0 cursor-pointer"
                title="Clear search and filters"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {allExams.length === 0 ? (
        /* Empty State 1: No assessments logged yet */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center">
          <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 shadow-xs">
            <ClipboardCheck size={28} />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            No Assessment Records Posted Yet
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
            Continuous assessments, test papers, and homework deliverables for <span className="font-semibold text-slate-700 dark:text-slate-300">{childDetails?.name || 'this student'}</span> will appear here as soon as subject teachers grade and publish them.
          </p>
          <button
            onClick={() => {
              refetchDashboard?.()
              refetchDetails?.()
            }}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-500/40 hover:bg-orange-50/50 dark:hover:bg-slate-800 transition-all shadow-xs"
          >
            <RotateCw size={13} />
            <span>Refresh Assessments</span>
          </button>
        </div>
      ) : filteredExams.length === 0 ? (
        /* Empty State 2: Filters yielded 0 results */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <SearchX size={24} />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            No Assessments Match Your Filters
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Try adjusting your search keywords, assessment category, or status filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 animate-in fade-in duration-300">
          {paginatedExams.map((exam, index) => {
            const itemNumber = (currentPage - 1) * itemsPerPage + index + 1
            const statusStyles = getStatusStyles(exam.status)
            return (
              <div 
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-orange-500/30 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center min-w-[26px] h-7 px-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 border border-orange-500/20 shadow-2xs">
                        #{itemNumber}
                      </span>
                      <div className={`size-8 sm:size-9 rounded-xl ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[17px] sm:text-[18px]">{exam.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          {exam.assessmentType}
                        </span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px] sm:max-w-[140px]">
                          {exam.subject}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${statusStyles.bg}`}>
                      {exam.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                    {exam.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Instructor: {exam.teacher}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      {exam.papersCount && exam.papersCount > 1 ? 'Cumulative Score' : 'Score'}
                    </span>
                    {exam.score !== null ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{exam.score}/{exam.totalScore}</span>
                        {exam.grade && (
                          <span className="text-[9px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                            Grade {exam.grade}
                          </span>
                        )}
                        {exam.papersCount && exam.papersCount > 1 && (
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            {exam.papersCount} Papers
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Scheduled</span>
                    )}
                  </div>

                  {exam.status === 'completed' ? (
                    <Link 
                      href={`/dashboard/parent/exams&results/details?id=${exam.examId || exam.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <span>Details</span>
                      <ArrowRight size={12} />
                    </Link>
                  ) : (
                    <div className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Lock size={11} />
                      <span>{exam.date}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden animate-in fade-in duration-300">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-900/50">
            <div className="col-span-1 text-center font-bold">#</div>
            <div className="col-span-4">Assessment Details</div>
            <div className="col-span-2 text-center">Score / Grade</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {paginatedExams.map((exam, index) => {
              const itemNumber = (currentPage - 1) * itemsPerPage + index + 1
              const statusStyles = getStatusStyles(exam.status)
              return (
                <div key={exam.id} className={`flex flex-col lg:grid lg:grid-cols-12 gap-4 px-6 py-4 lg:items-center border-b border-slate-100/60 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-900/20'}`}>
                  {/* Index Number */}
                  <div className="hidden lg:flex col-span-1 justify-center items-center">
                    <span className="flex items-center justify-center min-w-[26px] h-7 px-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-black">
                      #{itemNumber}
                    </span>
                  </div>
                  
                  {/* Details */}
                  <div className="col-span-4 flex items-center gap-3 lg:block">
                    <div className="lg:hidden flex items-center justify-center min-w-[26px] h-7 px-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[11px] font-black shrink-0">
                      #{itemNumber}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-600 transition-colors">{exam.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{exam.subject} • {exam.teacher}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 lg:text-center flex justify-between lg:justify-center items-center">
                    <span className="lg:hidden text-xs text-slate-400 font-bold uppercase">Score</span>
                    {exam.score !== null ? (
                      <div className="flex lg:flex-col items-center gap-2 lg:gap-0">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{exam.score}/{exam.totalScore}</span>
                        {exam.grade && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full lg:mt-1">Grade {exam.grade}</span>}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Scheduled</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 lg:text-center flex justify-between lg:justify-center items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="lg:hidden text-xs text-slate-400 font-bold uppercase">Date</span>
                    {exam.date}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-between lg:justify-center items-center">
                    <span className="lg:hidden text-xs text-slate-400 font-bold uppercase">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles.bg}`}>
                      {exam.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end mt-2 lg:mt-0">
                    {exam.status === 'completed' ? (
                      <Link href={`/dashboard/parent/exams&results/details?id=${exam.examId || exam.id}`} className="size-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors shadow-xs">
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <div className="size-8 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300">
                        <Lock size={13} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredExams.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          theme="orange"
        />
      ) : filteredExams.length > 0 ? (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/80 dark:bg-zinc-950/80 rounded-2xl border border-slate-200/80 dark:border-zinc-800 w-full shadow-xs">
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Showing all <span className="text-slate-900 dark:text-white font-bold">{filteredExams.length}</span> {filteredExams.length === 1 ? 'examination record' : 'examination records'}
          </p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
            Page 1 of 1
          </span>
        </div>
      ) : null}
    </div>
  )
}
