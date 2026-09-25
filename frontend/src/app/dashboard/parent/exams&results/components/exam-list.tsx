"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useChildExams } from '@/lib/api/hooks/useChildExams'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Map Upcoming Exams to pending
  const pendingExams: Exam[] = (dashboardData?.upcomingExams || []).map((exam: any) => ({
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
    <div className="flex flex-col flex-1 gap-6">
      {/* Insight Banner */}
      <div className="bg-orange-600/5 dark:bg-orange-600/10 border border-orange-500/10 dark:border-orange-500/20 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-xl">
        <div className="bg-orange-600 text-white rounded-xl p-2.5 shrink-0 shadow-lg shadow-orange-600/20">
          <span className="material-symbols-outlined text-[20px]">lightbulb</span>
        </div>
        <div>
          <h4 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">
            Parent Insight
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
            {childDetails?.name || 'Your child'} is showing consistent progress. Focus on {filteredExams[0]?.subject || 'current subjects'} to maintain the momentum.
          </p>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['ALL', 'EXAM', 'CA', 'ASSIGNMENT', 'TEST/QUIZ'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
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
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search */}
        <div className="relative w-full lg:max-w-md group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject or exam..."
            className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-orange-500/10 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-2 no-scrollbar">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-xl py-2.5 pl-4 pr-10 focus:ring-4 focus:ring-orange-500/10 cursor-pointer transition-all"
          >
            <option value="all" className="bg-white dark:bg-slate-800">All Subjects</option>
            {Array.from(new Set(allExams.map(e => e.subject))).map(sub => (
              <option key={sub} value={sub.toLowerCase()} className="bg-white dark:bg-slate-800">{sub}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-xl py-2.5 pl-4 pr-10 focus:ring-4 focus:ring-orange-500/10 cursor-pointer transition-all"
          >
            <option value="all" className="bg-white dark:bg-slate-800">All Status</option>
            <option value="completed" className="bg-white dark:bg-slate-800">Completed</option>
            <option value="pending" className="bg-white dark:bg-slate-800">Pending</option>
          </select>
        </div>
      </div>

      {/* Exam List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
          <div className="col-span-1 flex items-center justify-center"></div>
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
                  {/* Icon */}
                  <div className="hidden lg:flex col-span-1 justify-center">
                     <div className={`w-10 h-10 rounded-full ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[20px]">{exam.icon}</span>
                     </div>
                  </div>
                  
                  {/* Details */}
                  <div className="col-span-4 flex items-center gap-4 lg:block">
                     <div className={`lg:hidden w-10 h-10 rounded-full ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[20px]">{exam.icon}</span>
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{exam.title}</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{exam.subject} • {exam.teacher}</p>
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

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[11px] font-medium text-slate-500">
             Showing {filteredExams.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredExams.length)} of {filteredExams.length}
          </p>
          <div className="flex items-center gap-2">
             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 px-2 py-1 transition-colors">
                &lt; Previous
             </button>
             <span className="text-xs font-bold text-slate-700 bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">Page {currentPage} of {totalPages}</span>
             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-50 px-2 py-1 transition-colors">
                Next &gt;
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

