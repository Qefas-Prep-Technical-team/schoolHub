export type ExamType = 'exam' | 'quiz'
export type ExamStatus = 'draft' | 'scheduled' | 'completed' | 'graded' | 'cancelled'

export interface Exam {
  id: string
  title: string
  type: ExamType
  description?: string
  questions: number
  totalMarks: number
  passingMarks?: number
  duration?: number // in minutes
  scheduledDate: Date
  status: ExamStatus
  createdAt: Date
  updatedAt: Date
  classId: string
}

export interface ExamFilter {
  type?: ExamType
  status?: ExamStatus
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface Question {
  id: string
  examId: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string | string[]
  marks: number
  order: number
}