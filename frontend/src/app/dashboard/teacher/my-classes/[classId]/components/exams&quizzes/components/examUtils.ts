
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ExamStatus, ExamType } from './types'

export function getExamStatusColor(status: ExamStatus): string {
  switch (status) {
    case 'graded':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
    case 'scheduled':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
    case 'completed':
      return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300'
    case 'draft':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

export function getExamTypeLabel(type: ExamType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function getStatusLabel(status: ExamStatus): string {
  const labels: Record<ExamStatus, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    completed: 'Completed',
    graded: 'Graded',
    cancelled: 'Cancelled'
  }
  return labels[status]
}

export function formatExamDate(date: Date): string {
  return format(date, 'MMM d, yyyy')
}

export function formatExamDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a')
}

export function getExamDuration(duration?: number): string {
  if (!duration) return 'No time limit'
  if (duration < 60) return `${duration} min`
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}