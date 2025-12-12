'use client'

import { Calculator, Beaker, BookOpen, Globe, CalendarX, AlarmClock as Alarm, Calendar, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface AssignmentCardProps {
  id: string
  subject: string
  teacher: string
  title: string
  status: 'late' | 'urgent' | 'pending' | 'graded'
  dueDate: string
  icon: string
  score?: string
}

const iconMap = {
  calculate: Calculator,
  science: Beaker,
  book_2: BookOpen,
  public: Globe,
}

const statusConfig = {
  late: {
    borderColor: 'border-l-red-500 dark:border-l-red-500',
    badge: {
      text: 'Late Submission',
      bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
    dueIcon: CalendarX,
    dueColor: 'text-red-500',
    dueBg: 'bg-red-50 dark:bg-red-900/20',
    button: 'bg-primary hover:bg-blue-600 text-white',
  },
  urgent: {
    borderColor: 'border-l-orange-500 dark:border-l-orange-500',
    badge: {
      text: 'In Progress',
      bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
    },
    dueIcon: Alarm,
    dueColor: 'text-orange-600 dark:text-orange-400',
    dueBg: 'bg-orange-50 dark:bg-orange-900/20',
    button: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-primary text-slate-700 dark:text-white',
  },
  pending: {
    borderColor: 'border-l-primary dark:border-l-primary',
    badge: {
      text: 'Not Started',
      bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
    },
    dueIcon: Calendar,
    dueColor: 'text-slate-500 dark:text-slate-400',
    dueBg: '',
    button: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-primary text-slate-700 dark:text-white',
  },
  graded: {
    borderColor: 'border-l-green-500 dark:border-l-green-500',
    badge: {
      text: 'Graded',
      bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
    },
    dueIcon: CheckCircle,
    dueColor: 'text-green-600 dark:text-green-400',
    dueBg: '',
    button: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-primary text-slate-700 dark:text-white',
  },
}

export default function AssignmentCard({
  id,
  subject,
  teacher,
  title,
  status,
  dueDate,
  icon,
  score,
}: AssignmentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = statusConfig[status]
  const IconComponent = iconMap[icon as keyof typeof iconMap]
  const DueIcon = config.dueIcon

  return (
    <div
      className={`group bg-white dark:bg-surface-dark rounded-2xl border-l-4 ${config.borderColor} border-y border-r border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center ${
        status === 'graded' ? 'opacity-80 hover:opacity-100' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 shrink-0">
        <div className="size-10 flex items-center justify-center">
          {IconComponent && <IconComponent className="text-slate-600 dark:text-slate-300 size-8" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Subject & Teacher */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {subject}
          </span>
          <span className="size-1 bg-slate-300 rounded-full"></span>
          <span className="text-xs text-slate-400">{teacher}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
          {title}
        </h3>

        {/* Due Date */}
        <div className="flex items-center gap-4 mt-2">
          <div className={`flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-md ${
            config.dueBg ? config.dueBg : ''
          } ${config.dueColor}`}>
            <DueIcon className="size-4" />
            <span>{dueDate}</span>
          </div>
        </div>
      </div>

      {/* Actions & Status */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {/* Score (for graded assignments) */}
        {score && (
          <div className="text-right mr-2 hidden md:block">
            <p className="text-xs text-slate-400 font-medium uppercase">Score</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{score}</p>
          </div>
        )}

        {/* Status Badge */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.badge.bg} ${config.badge.border}`}>
          {config.badge.text}
        </span>

        {/* Action Button */}
        <Link
        href={`${score ===  'graded' ? "/dashboard/parent/assignments/details":"/dashboard/parent/assignments/upload"}`}
        >
        
        <button className={`text-sm font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${config.button}`}>
          {status === 'graded' ? 'View Feedback' : 'View Details'}
        </button>
        </Link>
      </div>

      {/* Mobile Score View (for graded assignments) */}
      {score && (
        <div className="flex md:hidden justify-between w-full pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-500">Score</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">{score}</span>
        </div>
      )}
    </div>
  )
}