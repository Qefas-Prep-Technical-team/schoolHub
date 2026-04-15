import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
    case 'closed':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
    case 'draft':
      return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300'
    default:
      return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300'
  }
}

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy')
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a')
}