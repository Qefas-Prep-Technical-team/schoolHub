// app/student/classes/data/classData.ts
export interface ClassDetail {
  id: number
  title: string
  code: string
  subject: string
  teacher: {
    name: string
    title: string
    avatar: string
    email: string
  }
  description: string
  stats: {
    attendance: number
    assignments: { completed: number; total: number }
    grade: string
    lastActivity: string
  }
  assignments: Assignment[]
}

export interface Assignment {
  id: number
  title: string
  dueDate: string
  status: 'graded' | 'submitted' | 'upcoming' | 'overdue'
  grade?: string
  maxPoints?: number
}

export const classData: ClassDetail[] = [
  {
    id: 1,
    title: 'Introduction to Physics',
    code: 'PHYS 101',
    subject: 'Physics',
    teacher: {
      name: 'Dr. Evelyn Reed',
      title: 'Professor of Physics',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzpJBc9oGpD_7Q1ry65YOoF1Qj-j9t2d0GTO9jACBLNtYXS_za2fnEEUxlBt0mNlY4rIjpE7pGMwbZASQPeiKVMUhkH5tsDcnX_bmV82ijcApR8BdMvPnciSevlRxcOhy7bPYU9bifb9T0XFnApyvOZZLc1tdkikqL698FTBmca0Ko4K1NvMGERqwTzmA50LG4B7xyAGqG38XGEYCvw4tkI_21PN8AE0GHcu21rszmo0R6e8ehnlH6tzTkOcd8p1Q6zjeUSseQ-gU',
      email: 'evelyn.reed@university.edu'
    },
    description: 'This course provides a comprehensive introduction to the fundamental principles of classical mechanics, electricity, and magnetism. Students will develop problem-solving skills and a conceptual understanding of the physical world through lectures, laboratory experiments, and interactive discussions.',
    stats: {
      attendance: 96,
      assignments: { completed: 12, total: 15 },
      grade: 'A-',
      lastActivity: 'Oct 26'
    },
    assignments: [
      {
        id: 1,
        title: 'Lab Report 1: Kinematics',
        dueDate: 'Oct 15, 2023',
        status: 'graded',
        grade: '95/100'
      },
      {
        id: 2,
        title: 'Homework 3: Newton\'s Laws',
        dueDate: 'Oct 22, 2023',
        status: 'submitted',
      },
      {
        id: 3,
        title: 'Midterm Exam Study Guide',
        dueDate: 'Nov 5, 2023',
        status: 'upcoming'
      },
      {
        id: 4,
        title: 'Project Proposal: Energy Conservation',
        dueDate: 'Nov 12, 2023',
        status: 'upcoming'
      }
    ]
  }
]