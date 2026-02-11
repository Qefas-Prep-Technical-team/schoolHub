'use client'

import { useState } from 'react'
import { Calculator, Beaker, BookOpen, Globe } from 'lucide-react'

interface Subject {
  id: string
  name: string
  teacher: string
  score: number
  grade: string
  color: string
  icon: React.ReactNode
  isActive: boolean
}

const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    teacher: 'Mr. Anderson',
    score: 92,
    grade: 'A Grade',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    icon: <Calculator className="size-6" />,
    isActive: true,
  },
  {
    id: 'science',
    name: 'Science',
    teacher: 'Mrs. Curie',
    score: 88,
    grade: 'B+ Grade',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    icon: <Beaker className="size-6" />,
    isActive: false,
  },
  {
    id: 'english',
    name: 'English',
    teacher: 'Ms. Rowling',
    score: 95,
    grade: 'A+ Grade',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    icon: <BookOpen className="size-6" />,
    isActive: false,
  },
  {
    id: 'history',
    name: 'History',
    teacher: 'Mr. Smith',
    score: 78,
    grade: 'C+ Grade',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    icon: <Globe className="size-6" />,
    isActive: false,
  },
]

export default function SubjectList() {
  const [selectedSubject, setSelectedSubject] = useState('math')

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full lg:w-1/3 flex flex-col gap-4">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className={`group relative cursor-pointer ${selectedSubject === subject.id ? 'active-subject' : ''}`}
          onClick={() => setSelectedSubject(subject.id)}
        >
          {subject.isActive && (
            <div className="absolute -left-1 top-2 bottom-2 w-1.5 bg-primary rounded-l-lg z-10"></div>
          )}
          
          <div className={`bg-surface-light dark:bg-surface-dark rounded-xl p-4 border transition-all ${
            selectedSubject === subject.id
              ? 'border-primary/30 shadow-md ring-1 ring-primary/10'
              : 'border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${subject.color}`}>
                  {subject.icon}
                </div>
                <div>
                  <h4 className="font-bold text-base">{subject.name}</h4>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {subject.teacher}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-lg font-bold ${
                  selectedSubject === subject.id
                    ? 'text-primary dark:text-blue-400'
                    : 'text-text-main-light dark:text-text-main-dark'
                }`}>
                  {subject.score}%
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  subject.score >= 90
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : subject.score >= 80
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {subject.grade}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-8 w-full flex items-end gap-1 mt-2 opacity-50">
              <div className="w-full bg-background-light dark:bg-background-dark h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(subject.score)}`}
                  style={{ width: `${subject.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}