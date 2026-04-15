'use client'
import { cn } from '@/lib/utils'
import { Icon } from '../../Icon'
import { Exam } from './types'

interface ExamStatsProps {
  exams: Exam[]
  className?: string
}

export function ExamStats({ exams, className }: ExamStatsProps) {
  const stats = {
    total: exams.length,
    exams: exams.filter(e => e.type === 'exam').length,
    quizzes: exams.filter(e => e.type === 'quiz').length,
    scheduled: exams.filter(e => e.status === 'scheduled').length,
    completed: exams.filter(e => e.status === 'completed' || e.status === 'graded').length,
    averageMarks: exams.length > 0 
      ? Math.round(exams.reduce((sum, exam) => sum + exam.totalMarks, 0) / exams.length)
      : 0,
    totalQuestions: exams.reduce((sum, exam) => sum + exam.questions, 0),
  }

  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: 'file_question',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Exams',
      value: stats.exams,
      icon: 'checklist',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Quizzes',
      value: stats.quizzes,
      icon: 'quiz',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: 'calendar_month',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: 'check_circle',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Avg. Marks',
      value: stats.averageMarks,
      icon: 'award',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ]

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-xl p-4 border border-gray-200 dark:border-gray-800",
            stat.bgColor
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
            <div className={cn(
              "p-2 rounded-lg",
              stat.bgColor.replace('bg-', 'bg-').replace('/20', '/30')
            )}>
              <Icon
                name={stat.icon}
                className={cn("h-5 w-5", stat.color)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}