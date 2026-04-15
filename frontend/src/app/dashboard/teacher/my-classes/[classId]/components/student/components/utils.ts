import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
    case 'suspended':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
    case 'transferred':
      return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
    default:
      return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
  }
}