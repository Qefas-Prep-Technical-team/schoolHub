export type StudentStatus = 'active' | 'suspended' | 'transferred'
export type Gender = 'male' | 'female'

export interface Student {
  id: string
  name: string
  studentId: string
  gender: Gender
  status: StudentStatus
  avatar: string
}

export interface ClassInfo {
  id: string
  name: string
  subject: string
  description: string
}