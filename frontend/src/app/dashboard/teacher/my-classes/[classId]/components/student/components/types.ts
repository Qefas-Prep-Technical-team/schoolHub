export type StudentStatus = 'active' | 'enrolled' | 'graduated' | 'expelled' | 'transferred' | 'suspended'
export type Gender = 'male' | 'female'

export interface Student {
  id: string
  name: string
  studentId: string
  studentCode?: string
  email?: string
  gender: Gender
  status: StudentStatus
  avatar: string
  performance?: string
  scorePercent?: number | null
  attendance?: string | number
  grade?: string
  lastExam?: string
  enrolledAt?: string
  createdAt?: string
}

