"use client"

import Link from 'next/link'
import { useState } from 'react'

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
  const [selectedTerm, setSelectedTerm] = useState('term1')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const exams: Exam[] = [
    {
      id: '1',
      title: 'Algebra Midterm',
      subject: 'Mathematics',
      teacher: 'Mr. Anderson',
      date: 'Oct 12',
      score: 92,
      totalScore: 100,
      grade: 'A',
      classAverage: 85,
      status: 'completed',
      accentColor: 'bg-green-500',
      icon: 'calculate',
      iconBgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: '2',
      title: 'Genetics Quiz 3',
      subject: 'Biology',
      teacher: 'Ms. Davis',
      date: 'Oct 24 (Tomorrow)',
      score: null,
      totalScore: 100,
      grade: null,
      classAverage: 0,
      status: 'pending',
      accentColor: 'bg-orange-400',
      icon: 'biotech',
      iconBgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: '3',
      title: 'Literature Review',
      subject: 'English',
      teacher: 'Mrs. Roberts',
      date: 'Oct 10',
      score: 78,
      totalScore: 100,
      grade: 'C+',
      classAverage: 82,
      status: 'completed',
      accentColor: 'bg-green-500',
      icon: 'menu_book',
      iconBgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: '4',
      title: 'World History Essay',
      subject: 'History',
      teacher: 'Mr. Clark',
      date: 'Oct 05',
      score: 0,
      totalScore: 100,
      grade: null,
      classAverage: 0,
      status: 'missed',
      accentColor: 'bg-red-500',
      icon: 'history_edu',
      iconBgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ]

  const getStatusStyles = (status: Exam['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-400',
          border: 'border-green-100 dark:border-green-800',
          dot: 'bg-green-500'
        }
      case 'pending':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-700 dark:text-orange-400',
          border: 'border-orange-100 dark:border-orange-800',
          dot: 'bg-orange-500'
        }
      case 'missed':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-100 dark:border-red-800',
          dot: 'bg-red-500'
        }
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Insight Banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 flex items-start gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-lg p-2 shrink-0">
          <span className="material-symbols-outlined">lightbulb</span>
        </div>
        <div>
          <h4 className="text-indigo-900 dark:text-indigo-200 font-bold text-sm">
            Parent Insight
          </h4>
          <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1">
            Emma is performing exceptionally well in analytical subjects this term. Consider encouraging extra-curriculars in STEM.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject or exam..."
            className="w-full bg-background-light dark:bg-gray-800 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 placeholder-text-secondary/70"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-background-light dark:bg-gray-800 border-none text-text-main dark:text-white text-sm font-medium rounded-lg py-2.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer whitespace-nowrap"
          >
            <option value="all">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="english">English</option>
          </select>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-background-light dark:bg-gray-800 border-none text-text-main dark:text-white text-sm font-medium rounded-lg py-2.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer whitespace-nowrap"
          >
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-background-light dark:bg-gray-800 border-none text-text-main dark:text-white text-sm font-medium rounded-lg py-2.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer whitespace-nowrap"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Exam Cards List */}
      <div className="flex flex-col gap-4">
        {/* Header Row for Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
          <div className="col-span-4">Exam Details</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-3">Performance vs Class</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Exam Cards */}
        {exams.map((exam) => {
          const statusStyles = getStatusStyles(exam.status)
          const performanceDiff = exam.score ? exam.score - exam.classAverage : 0
          
          return (
            <Link
            href={"/dashboard/parent/exams&results/details"}
              key={exam.id}
              className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-4 md:grid md:grid-cols-12 md:items-center md:gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Left Accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${exam.accentColor}`}></div>

              {/* Subject & Title */}
              <div className="col-span-4 flex items-center gap-4 mb-4 md:mb-0">
                <div className={`size-12 rounded-lg ${exam.iconBgColor} ${exam.iconColor} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined">{exam.icon}</span>
                </div>
                <div>
                  <h3 className="text-text-main dark:text-white font-bold text-base">
                    {exam.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {exam.subject} • {exam.teacher} • {exam.date}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="col-span-2 flex items-center gap-3 mb-4 md:mb-0">
                {exam.score !== null ? (
                  <>
                    <div className="text-2xl font-black text-text-main dark:text-white">
                      {exam.score}
                      <span className="text-sm text-text-secondary font-medium">/{exam.totalScore}</span>
                    </div>
                    {exam.grade && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">
                        {exam.grade}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-bold text-text-secondary">--</div>
                )}
              </div>

              {/* Comparison */}
              <div className="col-span-3 mb-4 md:mb-0">
                {exam.score !== null ? (
                  <>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>Class Avg: {exam.classAverage}%</span>
                      <span className={`${performanceDiff >= 0 ? 'text-green-600' : 'text-red-500'} font-bold`}>
                        {performanceDiff >= 0 ? '+' : ''}{performanceDiff}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                      {/* Class Avg Marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-gray-400 z-10" 
                        style={{ left: `${exam.classAverage}%` }}
                      ></div>
                      {/* Student Score */}
                      <div 
                        className={`h-full rounded-full ${performanceDiff >= 0 ? 'bg-primary' : 'bg-yellow-500'}`}
                        style={{ width: `${exam.score}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-secondary italic">Awaiting Results</p>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2 mb-4 md:mb-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                  <span className={`size-1.5 rounded-full ${statusStyles.dot} ${exam.status === 'pending' ? 'animate-pulse' : ''}`}></span>
                  {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </span>
              </div>

              {/* Action */}
              <div className="col-span-1 flex justify-end">
                <button className={`size-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors ${
                  exam.status === 'missed' ? 'hidden' : ''
                }`}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                {exam.status === 'missed' && (
                  <button className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors">
                    Contact
                  </button>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-text-secondary">Showing 1-4 of 12 exams</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-text-secondary bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Previous
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}