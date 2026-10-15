"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useChildExams } from '@/lib/api/hooks/useChildExams'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip'
import { LayoutGrid, List } from 'lucide-react'

interface Exam {
  id: string
  title: string
  subject: string
  teacher: string
  date: string
  score: number | null
  totalScore: number
  grade: string | null
  classAverage: number
  status: 'completed' | 'pending' | 'missed'
  accentColor: string
  icon: string
  iconBgColor: string
  iconColor: string
  assessmentType: string
}

export default function ExamList() {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedTerm, setSelectedTerm] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXAM' | 'CA' | 'ASSIGNMENT' | 'TEST/QUIZ'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const { selectedChildId } = useParentStore()
  const { data: dashboardData, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId)
  const { data: childDetails, isLoading: isDetailsLoading } = useChildExams(selectedChildId)

  const isLoading = isDashboardLoading || isDetailsLoading

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedSubject, selectedTerm, selectedStatus, activeTab])

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 gap-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  // Map Grades to completed exams
  const completedExams: Exam[] = (childDetails?.grades || []).map((grade: any) => ({
    id: grade.id,
    title: grade.exam?.title || grade.subjectPaper?.title || 'Subject Assessment',
    subject: grade.subject || grade.subjectPaper?.subject?.name || 'Unknown',
    teacher: grade.subjectPaper?.teacher?.name || 'School Teacher',
    date: format(new Date(grade.createdAt), 'MMM dd'),
    score: grade.score,
    totalScore: grade.maxMarks,
    grade: gradeLabel(Math.round((grade.score / grade.maxMarks) * 100)),
    classAverage: 75, // Placeholder if not available in API
    status: 'completed',
    accentColor: 'bg-green-500',
    icon: 'grade',
    iconBgColor: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
    assessmentType: grade.assessmentType || grade.category || 'EXAM'
  }))

  // Track completed exam IDs and titles to prevent duplicates or showing completed exams as pending
  const completedExamIds = new Set(
    (childDetails?.grades || []).map((g: any) => g.examId || g.exam?.id).filter(Boolean)
  )
  const completedTitles = new Set(
    (childDetails?.grades || []).map((g: any) => (g.exam?.title || g.subjectPaper?.title || '').toLowerCase().trim()).filter(Boolean)
  )

  // Map Upcoming Exams to pending - strictly eligible exams for this student
  const pendingExams: Exam[] = (dashboardData?.upcomingExams || [])
    .filter((exam: any) => {
      if (completedExamIds.has(exam.id)) return false
      if (exam.title && completedTitles.has(exam.title.toLowerCase().trim())) return false
      return true
    })
    .map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      subject: exam.subject?.name || 'General',
      teacher: 'Staff',
      date: format(new Date(exam.startDate), 'MMM dd'),
      score: null,
      totalScore: 100,
      grade: null,
      classAverage: 0,
      status: 'pending',
      accentColor: 'bg-orange-400',
      icon: 'event',
      iconBgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      assessmentType: 'EXAM'
    }))

  const allExams = [...pendingExams, ...completedExams]

  const filteredExams = allExams.filter(exam => {
    const titleMatch = exam.title ? String(exam.title).toLowerCase().includes(search.toLowerCase()) : false;
    const subjectMatch = exam.subject ? String(exam.subject).toLowerCase().includes(search.toLowerCase()) : false;
    const matchesSearch = titleMatch || subjectMatch;
    const matchesSubject = selectedSubject === 'all' || exam.subject.toLowerCase() === selectedSubject.toLowerCase()
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus
    
    let matchesTab = true;
    if (activeTab !== 'ALL') {
      const type = exam.assessmentType.toUpperCase();
      if (activeTab === 'TEST/QUIZ') matchesTab = type === 'TEST' || type === 'QUIZ' || type === 'TEST/QUIZ';
      else matchesTab = type === activeTab;
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
          bg: 'bg-green-500/10 dark:bg-green-500/20',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-500/20',
          dot: 'bg-green-500'
        }
      case 'pending':
        return {
          bg: 'bg-orange-500/10 dark:bg-orange-500/20',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-500/20',
          dot: 'bg-orange-500'
        }
      case 'missed':
        return {
          bg: 'bg-red-500/10 dark:bg-red-500/20',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-500/20',
          dot: 'bg-red-500'
        }
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-4 sm:gap-6">
      {/* Insight Banner */}
      <div className="bg-orange-600/5 dark:bg-orange-600/10 border border-orange-500/10 dark:border-orange-500/20 rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 backdrop-blur-xl">
        <div className="bg-orange-600 text-white rounded-xl p-2 sm:p-2.5 shrink-0 shadow-lg shadow-orange-600/20">
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">lightbulb</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-tight">
              Parent Insight
            </h4>
            <HeaderTooltip
              content="Automated academic evaluation summarizing assessment trends, test frequency, and specific subject areas where steady focus produces the greatest score improvement."
              size={13}
            />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            {childDetails?.name || 'Your child'} is showing consistent progress. Focus on {filteredExams[0]?.subject || 'current subjects'} to maintain the momentum.
          </p>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Continuous Assessment Records
          </h3>
          <HeaderTooltip
            content={`Itemized breakdown of all recorded examinations, continuous assessments (CA), homework assignments, and quizzes for ${childDetails?.name || 'this student'}. Filter by assessment category, subject, or completion status to isolate specific academic deliverables.`}
            size={14}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
            {filteredExams.length} {filteredExams.length === 1 ? 'Record' : 'Records'}
          </span>
          <div className="flex shrink-0 items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl h-9 border border-slate-200/60 dark:border-white/10">
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid size={15} strokeWidth={2.5} />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <List size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['ALL', 'EXAM', 'CA', 'ASSIGNMENT', 'TEST/QUIZ'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-md group">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject or exam..."
            className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-orange-500/10 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 focus:ring-4 focus:ring-orange-500/10 cursor-pointer transition-all"
          >
            <option value="all" className="bg-white dark:bg-slate-800">All Subjects</option>
            {Array.from(new Set(allExams.map(e => e.subject))).map(sub => (
              <option key={sub} value={sub.toLowerCase()} className="bg-white dark:bg-slate-800">{sub}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 focus:ring-4 focus:ring-orange-500/10 cursor-pointer transition-all"
          >
            <option value="all" className="bg-white dark:bg-slate-800">All Status</option>
            <option value="completed" className="bg-white dark:bg-slate-800">Completed</option>
            <option value="pending" className="bg-white dark:bg-slate-800">Pending</option>
          </select>
        </div>
      </div>

      {/* Grid or Table List View */}
      {viewMode === 'grid' ? (
        filteredExams.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
            <p className="text-slate-500 font-medium">No assessments found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 animate-in fade-in duration-300">
            {paginatedExams.map((exam) => {
              const statusStyles = getStatusStyles(exam.status)
              return (
                <div 
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`size-9 rounded-xl ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-[18px]">{exam.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                            {exam.assessmentType}
                          </span>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {exam.subject}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyles.bg} ${statusStyles.text}`}>
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
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Score</span>
                      {exam.score !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{exam.score}/{exam.totalScore}</span>
                          {exam.grade && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                              Grade {exam.grade}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">TBD</span>
                      )}
                    </div>

                    {exam.status === 'completed' ? (
                      <Link 
                        href={`/dashboard/parent/exams&results/details?id=${exam.id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                      >
                        Details
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    ) : (
                      <div className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        {exam.date}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Exam List Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
            <div className="col-span-1 text-center font-bold">#</div>
            <div className="col-span-4">Assessment Details</div>
            <div className="col-span-2 text-center">Score / Grade</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {filteredExams.length === 0 ? (
               <div className="p-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                  <p className="text-slate-500 font-medium">No assessments found matching your criteria</p>
               </div>
            ) : paginatedExams.map((exam, index) => {
               const statusStyles = getStatusStyles(exam.status)
               return (
                 <div key={exam.id} className={`flex flex-col lg:grid lg:grid-cols-12 gap-4 px-6 py-4 lg:items-center border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/30 dark:bg-slate-900/20'}`}>
                    {/* Index Number */}
                    <div className="hidden lg:flex col-span-1 justify-center items-center">
                       <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                         {(currentPage - 1) * itemsPerPage + index + 1}
                       </span>
                    </div>
                    
                    {/* Details */}
                    <div className="col-span-4 flex items-center gap-3 lg:block">
                       <div className="lg:hidden flex items-center justify-center size-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-500 shrink-0">
                         {(currentPage - 1) * itemsPerPage + index + 1}
                       </div>
                       <div className={`w-10 h-10 rounded-full ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-[20px]">{exam.icon}</span>
                       </div>
                       <div className="min-w-0">
                         <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{exam.title}</h4>
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
                         <span className="text-xs font-bold text-slate-400">TBD</span>
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
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles.bg} ${statusStyles.text}`}>
                          {exam.status}
                       </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end mt-4 lg:mt-0">
                       {exam.status === 'completed' ? (
                         <Link href={`/dashboard/parent/exams&results/details?id=${exam.id}`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                         </Link>
                       ) : (
                         <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <p className="text-[11px] font-medium text-slate-500">
          Showing {filteredExams.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredExams.length)} of {filteredExams.length}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 px-2 py-1 transition-colors">
            &lt; Previous
          </button>
          <span className="text-xs font-bold text-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 px-2 py-1 transition-colors">
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  )
}

