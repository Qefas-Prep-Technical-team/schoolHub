export type GradeStatus = 'graded' | 'pending' | 'missing' | 'excused'
export type GradeType = 'assignment' | 'exam' | 'quiz' | 'participation'

export interface StudentGrade {
  id: string
  studentId: string
  studentName: string
  avatar?: string
  individualGrades?: IndividualGrade[]
  grades: {
    continuousAssessment: GradeScore
    exams: GradeScore
    total: number // percentage
    position?: number
  }
  status: GradeStatus
  lastUpdated?: Date
  notes?: string
}

export interface IndividualGrade {
  id: string
  teacherId?: string
  category: string
  type?: string
  subject?: string
  assessmentName?: string
  paper?: string
  title: string
  score?: number
  maxMarks: number
  status: string
  submittedAt?: string | Date
  createdAt: string | Date
  updatedAt: string | Date
}

export interface GradeScore {
  score?: number
  total: number
  percentage?: number
}

export interface GradeItem {
  id: string
  title: string
  type: GradeType
  maxScore: number
  weight: number // percentage
  dueDate?: Date
  category: string
}

export interface GradeFilter {
  status?: GradeStatus | string
  search?: string
  minScore?: number
  maxScore?: number
  type?: string
  subject?: string
}

export interface GradeStatistics {
  averageScore: number
  highestScore: number
  lowestScore: number
  passingRate: number
  gradeDistribution: Record<string, number> // A: 5, B: 10, etc.
}