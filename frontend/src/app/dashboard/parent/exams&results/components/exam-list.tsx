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
}

export default function ExamList() {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedTerm, setSelectedTerm] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { selectedChildId } = useParentStore()
  const { data: dashboardData, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId)
  const { data: childDetails, isLoading: isDetailsLoading } = useChildExams(selectedChildId)

  const isLoading = isDashboardLoading || isDetailsLoading

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedSubject, selectedTerm, selectedStatus])

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
    iconColor: 'text-green-600 dark:text-green-400'
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
    iconColor: 'text-orange-600 dark:text-orange-400'
  }))

  const allExams = [...pendingExams, ...completedExams]

  const filteredExams = allExams.filter(exam => {
    const titleMatch = exam.title ? String(exam.title).toLowerCase().includes(search.toLowerCase()) : false;
    const subjectMatch = exam.subject ? String(exam.subject).toLowerCase().includes(search.toLowerCase()) : false;
    const matchesSearch = titleMatch || subjectMatch;
    const matchesSubject = selectedSubject === 'all' || exam.subject.toLowerCase() === selectedSubject.toLowerCase()
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus
    return matchesSearch && matchesSubject && matchesStatus
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

      {/* Exam Cards List */}
      <div className="flex flex-col gap-4">
        {/* Header Row for Desktop */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-4">Exam Details</div>
          <div className="col-span-2 text-center">Score / Grade</div>
          <div className="col-span-3">Performance vs Class</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right">View</div>
        </div>

        {/* Exam Cards */}
        {filteredExams.length === 0 ? (
          <div className="bg-white/50 dark:bg-white/5 rounded-[2rem] p-20 text-center border border-dashed border-slate-200 dark:border-white/10">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
            <p className="text-slate-500 dark:text-slate-400 font-bold">No exams found matching your criteria</p>
          </div>
        ) : paginatedExams.map((exam) => {
          const statusStyles = getStatusStyles(exam.status)
          const performanceDiff = exam.score ? exam.score - exam.classAverage : 0
          
          return (
            <Link
              href={exam.status === 'completed' ? `/dashboard/parent/exams&results/details?id=${exam.id}` : '#'}
              key={exam.id}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-4 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
            >
              {/* Left Accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${exam.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

              {/* Subject & Title */}
              <div className="col-span-4 flex items-center gap-5 mb-6 lg:mb-0">
                <div className={`size-14 rounded-2xl ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  <span className="material-symbols-outlined text-[28px]">{exam.icon}</span>
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-black text-lg tracking-tight group-hover:text-orange-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-1">
                    {exam.subject} • {exam.teacher} • {exam.date}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="col-span-2 flex flex-col items-center justify-center gap-1 mb-6 lg:mb-0 bg-slate-50 dark:bg-white/5 py-4 rounded-2xl border border-slate-100 dark:border-white/5">
                {exam.score !== null ? (
                  <>
                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {exam.score}
                      <span className="text-[14px] text-slate-400 font-bold">/{exam.totalScore}</span>
                    </div>
                    {exam.grade && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                        Grade {exam.grade}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-black text-slate-300 dark:text-slate-700 tracking-widest uppercase">TBD</div>
                )}
              </div>

              {/* Comparison */}
              <div className="col-span-3 mb-6 lg:mb-0 px-4">
                {exam.score !== null ? (
                  <>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      <span>Avg: {exam.classAverage}%</span>
                      <span className={`${performanceDiff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {performanceDiff >= 0 ? '↑' : '↓'} {Math.abs(performanceDiff)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-slate-300 dark:bg-slate-600 z-10" 
                        style={{ left: `${exam.classAverage}%` }}
                      ></div>
                      <div 
                        className={`h-full rounded-full ${performanceDiff >= 0 ? 'bg-orange-600' : 'bg-amber-500'} transition-all duration-1000`}
                        style={{ width: `${(exam.score / exam.totalScore) * 100}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] font-bold text-slate-400 italic text-center uppercase tracking-widest">Awaiting Results</p>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2 mb-6 lg:mb-0 flex justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                  <span className={`size-2 rounded-full ${statusStyles.dot} ${exam.status === 'pending' ? 'animate-pulse' : ''}`}></span>
                  {exam.status}
                </span>
              </div>

              {/* Action */}
              <div className="col-span-1 flex justify-end">
                <div className="size-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 px-4">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Showing <span className="text-slate-900 dark:text-white">
            {filteredExams.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredExams.length)}
          </span> of <span className="text-slate-900 dark:text-white">{filteredExams.length}</span> assessments
        </p>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-30">
            Previous
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-30">
            Next Page
          </button>
        </div>
      </div>
    </div>
  )
}

