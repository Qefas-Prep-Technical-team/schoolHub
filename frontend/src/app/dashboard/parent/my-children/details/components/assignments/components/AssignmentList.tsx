'use client'

import { useState } from 'react'
import { Beaker, Calculator, PenTool, Palette } from 'lucide-react'

interface AssignmentItem {
  id: string
  title: string
  subject: string
  subjectColor: string
  subjectIcon: React.ReactNode
  dueDate: string
  status: 'pending' | 'submitted' | 'graded' | 'late'
  grade?: string
  isSelected?: boolean
}

const assignments: AssignmentItem[] = [
  {
    id: '1',
    title: 'Volcano Model Project',
    subject: 'Science',
    subjectColor: 'text-orange-600 dark:text-orange-400',
    subjectIcon: <Beaker className="size-6" />,
    dueDate: 'Due Oct 24, 2023',
    status: 'pending',
    isSelected: true,
  },
  {
    id: '2',
    title: 'Algebra II - Chapter 5 Quiz',
    subject: 'Math',
    subjectColor: 'text-blue-600 dark:text-blue-400',
    subjectIcon: <Calculator className="size-6" />,
    dueDate: 'Due Oct 20, 2023',
    status: 'submitted',
  },
  {
    id: '3',
    title: 'World War II Essay',
    subject: 'History',
    subjectColor: 'text-purple-600 dark:text-purple-400',
    subjectIcon: <PenTool className="size-6" />,
    dueDate: 'Due Oct 15, 2023',
    status: 'graded',
    grade: '85/100',
  },
  {
    id: '4',
    title: 'Perspective Drawing',
    subject: 'Art',
    subjectColor: 'text-rose-600 dark:text-rose-400',
    subjectIcon: <Palette className="size-6" />,
    dueDate: 'Due Oct 10, 2023',
    status: 'late',
  },
]

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  graded: {
    label: 'Graded',
    className: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  },
  late: {
    label: 'Late',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
}

export default function AssignmentList() {
  const [selectedId, setSelectedId] = useState('1')

  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      {assignments.map((assignment) => {
        const status = statusConfig[assignment.status]
        const isSelected = assignment.id === selectedId

        return (
          <div
            key={assignment.id}
            onClick={() => setSelectedId(assignment.id)}
            className={`group relative flex flex-col gap-3 p-5 rounded-2xl bg-surface-light dark:bg-surface-dark cursor-pointer transition-all hover:-translate-y-1 ${
              isSelected
                ? 'shadow-md border-l-4 border-primary'
                : 'shadow-sm border border-transparent hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className={`size-10 rounded-full ${
                  assignment.subjectColor.replace('text-', 'bg-').replace('dark:', 'dark:bg-')
                }/10 flex items-center justify-center ${assignment.subjectColor}`}>
                  {assignment.subjectIcon}
                </div>
                <div>
                  <span className={`text-xs font-bold ${assignment.subjectColor} tracking-wider uppercase`}>
                    {assignment.subject}
                  </span>
                  <h3 className={`text-base font-bold leading-tight transition-colors ${
                    isSelected || 'group-hover:text-primary'
                  }`}>
                    {assignment.title}
                  </h3>
                </div>
              </div>
              {isSelected && (
                <span className="material-symbols-outlined text-primary">chevron_right</span>
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <span className="material-symbols-outlined text-lg">event</span>
                <span>{assignment.dueDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {assignment.grade && (
                  <div className="px-3 py-1 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">{assignment.grade}</span>
                  </div>
                )}
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}