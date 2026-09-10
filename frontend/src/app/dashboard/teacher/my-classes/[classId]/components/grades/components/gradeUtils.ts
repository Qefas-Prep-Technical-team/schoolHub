
import { GradeStatus, StudentGrade } from './types'

export function getGradeStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase()
  switch (normalizedStatus) {
    case 'graded':
    case 'published':
    case 'scored':
      return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
    case 'pending':
    case 'draft':
      return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
    case 'missing':
      return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
    case 'excused':
    case 'submitted':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
    case 'archived':
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }
}

export function getStatusLabel(status: GradeStatus): string {
  const labels: Record<GradeStatus, string> = {
    graded: 'Graded',
    pending: 'Pending',
    missing: 'Missing',
    excused: 'Excused'
  }
  return labels[status]
}

export function calculateLetterGrade(percentage: number): string {
  if (percentage >= 70) return 'A'
  if (percentage >= 60) return 'B'
  if (percentage > 40) return 'C'
  return 'F'
}

export function getLetterGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-emerald-600 dark:text-emerald-400' // green
    case 'B': return 'text-blue-600 dark:text-blue-400'       // blue
    case 'C': return 'text-yellow-600 dark:text-yellow-400'   // yellow
    case 'F': return 'text-red-600 dark:text-red-400'         // red
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

export function getLetterGradeBgColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-100 dark:bg-emerald-900/30'
    case 'B': return 'bg-blue-100 dark:bg-blue-900/30'
    case 'C': return 'bg-yellow-100 dark:bg-yellow-900/30'
    case 'F': return 'bg-red-100 dark:bg-red-900/30'
    default: return 'bg-gray-100 dark:bg-gray-800'
  }
}

export function formatPosition(position: number): string {
  const suffix = ['th', 'st', 'nd', 'rd']
  const v = position % 100
  return position + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
}

export function calculateClassAverage(grades: StudentGrade[]): number {
  const validGrades = grades.filter(g => g.grades.total && g.status === 'graded')
  if (validGrades.length === 0) return 0
  const sum = validGrades.reduce((acc, g) => acc + g.grades.total, 0)
  return Math.round((sum / validGrades.length) * 100) / 100
}