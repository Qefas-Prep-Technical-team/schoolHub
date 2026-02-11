import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { AssignmentStatus, ClassStatus } from './types'

export function getClassStatusColor(status: ClassStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
    case 'ongoing':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    case 'next':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    case 'upcoming':
      return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }
}

export function getAssignmentStatusColor(status: AssignmentStatus): string {
  switch (status) {
    case 'in-progress':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'not-started':
      return 'text-red-600 dark:text-red-400'
    case 'submitted':
      return 'text-blue-600 dark:text-blue-400'
    case 'graded':
      return 'text-green-600 dark:text-green-400'
    case 'late':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'history': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    'mathematics': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    'chemistry': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    'physics': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    'english': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    'biology': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    'default': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }
  
  const key = subject.toLowerCase()
  return colors[key] || colors.default
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Due today'
  if (diffInDays === 1) return 'Due tomorrow'
  if (diffInDays === -1) return 'Due yesterday'
  if (diffInDays > 0) return `Due in ${diffInDays} days`
  return `${Math.abs(diffInDays)} days ago`
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
}

export function calculatePercentage(score: number, total: number): number {
  return Math.round((score / total) * 100)
}