export type StudentStatus = 'active' | 'suspended' | 'transferred'
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
  attendance?: string | number
  grade?: string
  lastExam?: string
}

