// app/student/classes/[id]/assignments/data/assignmentsData.ts
export interface Assignment {
  id: number
  title: string
  dueDate: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'graded' | 'submitted' | 'pending' | 'overdue'
  type?: 'essay' | 'quiz' | 'project'
  isDueToday?: boolean
}

export interface ClassAssignments {
  id: number
  title: string
  assignments: Assignment[]
}

export const assignmentsData: ClassAssignments[] = [
  {
    id: 1,
    title: 'History 101',
    assignments: [
      {
        id: 1,
        title: 'The Roman Empire: Rise and Fall',
        dueDate: 'Oct 10, 2023',
        difficulty: 'medium',
        status: 'graded',
        type: 'essay'
      },
      {
        id: 2,
        title: 'Medieval Europe Quiz',
        dueDate: 'Oct 20, 2023',
        difficulty: 'easy',
        status: 'submitted',
        type: 'quiz'
      },
      {
        id: 3,
        title: 'Renaissance Art Project Proposal',
        dueDate: 'Oct 26, 2023',
        difficulty: 'medium',
        status: 'pending',
        type: 'project',
        isDueToday: true
      },
      {
        id: 4,
        title: 'The Age of Enlightenment Essay',
        dueDate: 'Oct 18, 2023',
        difficulty: 'hard',
        status: 'overdue',
        type: 'essay'
      }
    ]
  }
]

export const filterOptions = {
  status: ['pending', 'submitted', 'graded'],
  type: ['essay', 'quiz', 'project'],
  sort: ['Due Date (Newest)', 'Due Date (Oldest)', 'Difficulty']
}