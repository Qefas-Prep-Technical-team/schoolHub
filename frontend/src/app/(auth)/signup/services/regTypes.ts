export type UserType = 'school' | 'teacher' | 'student' | 'parent'

// Separate interfaces for each registration type
export interface SchoolRegistrationData {
  schoolName: string
  adminName: string
  email: string
  password: string
  subdomain?: string
}

export interface TeacherRegistrationData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  tenantId?: string
}

export interface StudentRegistrationData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  tenantId?: string
  teacherCode?: string
}

export interface ParentRegistrationData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  studentCode?: string
}

// Union type for all registration data
export type RegistrationPayload = 
  | ({ userType: 'school' } & SchoolRegistrationData)
  | ({ userType: 'teacher' } & TeacherRegistrationData)
  | ({ userType: 'student' } & StudentRegistrationData)
  | ({ userType: 'parent' } & ParentRegistrationData)

// Store data interface
export interface RegistrationStoreData {
  userType: UserType | null
  fullName: string
  email: string
  password: string
  confirmPassword: string
  schoolName: string
  adminName: string
  subdomain: string
  tenantId: string
  teacherCode: string
  studentCode: string
}