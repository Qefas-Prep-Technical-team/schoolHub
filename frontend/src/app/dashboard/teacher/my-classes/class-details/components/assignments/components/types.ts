export type AssignmentStatus = 'published' | 'closed' | 'draft'

export interface Assignment {
  id: string
  title: string
  description?: string
  dueDate: Date
  status: AssignmentStatus
  submissions: {
    submitted: number
    total: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  active?: boolean
  badge?: number
}

export interface User {
  id: string
  name: string
  role: string
  avatar: string
  email: string
}