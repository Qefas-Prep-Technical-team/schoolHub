export type ClassStatus = 'completed' | 'ongoing' | 'next' | 'upcoming'
export type AssignmentStatus = 'not-started' | 'in-progress' | 'submitted' | 'graded' | 'late'
export type PerformanceTrend = 'up' | 'down' | 'same'

export interface Student {
  id: string
  name: string
  avatar: string
  email: string
  gradeLevel: string
  studentId: string
}

export interface StatCardT {
  id: string
  title: string
  value: string | number
  icon: string
  color: string
  secondaryValue?: string
  link?: string
  linkText?: string
  data?: number[] // For charts
  chartData?: number[]
}

export interface TodayClass {
  id: string
  subject: string
  teacher: string
  room: string
  time: string
  status: ClassStatus
}

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: Date
  status: AssignmentStatus
  points?: number
  totalPoints: number
  description?: string
  link?: string
}

export interface ExamResult {
  id: string
  title: string
  subject: string
  score: number
  total: number
  average: number
  date: Date
  trend: PerformanceTrend
}

export interface Announcement {
  id: string
  title: string
  content?: string
  author: string
  department?: string
  date: Date
  priority: 'high' | 'medium' | 'low'
}

export interface AttendanceData {
  day: string
  percentage: number
  present: boolean
}