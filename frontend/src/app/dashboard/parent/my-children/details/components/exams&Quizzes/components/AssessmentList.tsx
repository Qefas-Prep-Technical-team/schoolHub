'use client'

import { useState } from 'react'
import { Eye, ChevronRight, School } from 'lucide-react'

interface Assessment {
  id: string
  subject: string
  subjectColor: string
  date: string
  title: string
  score?: string
  status?: 'completed' | 'pending'
  isSelected?: boolean
}

const assessments: Assessment[] = [
  {
    id: '1',
    subject: 'Math',
    subjectColor: 'bg-primary',
    date: 'Oct 12',
    title: 'Mid-Term Math',
    score: '92%',
    status: 'completed',
    isSelected: true,
  },
  {
    id: '2',
    subject: 'Science',
    subjectColor: 'bg-purple-500',
    date: 'Oct 10',
    title: 'Physics Quiz 3',
    score: '78%',
    status: 'completed',
  },
  {
    id: '3',
    subject: 'History',
    subjectColor: 'bg-orange-500',
    date: 'Oct 05',
    title: 'World War II Essay',
    score: '88%',
    status: 'completed',
  },
  {
    id: '4',
    subject: 'English',
    subjectColor: 'bg-gray-500',
    date: 'Sep 28',
    title: 'Literature Review',
    status: 'pending',
  },
]

const subjects = ['All', 'Math', 'Science', 'History']

export default function AssessmentList() {
  const [selectedId, setSelectedId] = useState('1')
  const [activeSubject, setActiveSubject] = useState('All')

  return (
    <div className="w-full lg:w-96 flex flex-col gap-6">
      {/* List Container */}
      <div className="flex h-full flex-col rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
        <div className="border-b border-border-light dark:border-border-dark p-4">
          <h3 className="font-bold text-text-main-light dark:text-text-main-dark">
            Recent Assessments
          </h3>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto p-4 pb-0 no-scrollbar">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSubject === subject
                  ? 'bg-text-main-light text-white dark:bg-white dark:text-black'
                  : 'border border-border-light bg-white text-text-sec-light hover:bg-background-light dark:border-border-dark dark:bg-background-dark dark:text-text-sec-dark dark:hover:bg-surface-dark'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            {assessments.map((assessment) => {
              const isSelected = assessment.id === selectedId

              return (
                <div
                  key={assessment.id}
                  onClick={() => setSelectedId(assessment.id)}
                  className={`group relative flex cursor-pointer flex-col gap-2 rounded-xl p-3 transition-all ${
                    isSelected
                      ? 'border border-primary bg-primary/5'
                      : 'border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${assessment.subjectColor}`}
                    >
                      {assessment.subject}
                    </span>
                    <span className="text-xs text-text-sec-light dark:text-text-sec-dark">
                      {assessment.date}
                    </span>
                  </div>
                  <h4 className={`font-bold ${
                    isSelected ? 'text-primary' : 'text-text-main-light dark:text-text-main-dark'
                  }`}>
                    {assessment.title}
                  </h4>
                  <div className="mt-1 flex items-center justify-between">
                    {assessment.score ? (
                      <span className={`text-sm font-medium ${
                        isSelected ? 'font-semibold text-text-main-light dark:text-text-main-dark' : 'text-text-sec-light dark:text-text-sec-dark'
                      }`}>
                        Score: {assessment.score}
                      </span>
                    ) : (
                      <span className="rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                        PENDING
                      </span>
                    )}
                    {isSelected ? (
                      <Eye className="text-primary size-5" />
                    ) : (
                      <ChevronRight className="text-text-sec-light dark:text-text-sec-dark size-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border-light dark:border-border-dark p-3 text-center">
          <button className="text-xs font-bold text-primary hover:underline transition-colors">
            View All History
          </button>
        </div>
      </div>

      {/* Mini Promo/Action */}
      <div className="rounded-xl bg-gradient-to-br from-primary to-blue-600 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
              <School className="size-5" />
            </div>
            <h4 className="font-bold leading-tight">Book a Teacher Conference</h4>
            <p className="text-xs text-blue-100">
              Discuss the recent math results with Mr. Johnson.
            </p>
          </div>
        </div>
        <button className="mt-4 w-full rounded-lg bg-white py-2 text-xs font-bold text-primary hover:bg-blue-50 transition-colors">
          Schedule Now
        </button>
      </div>
    </div>
  )
}