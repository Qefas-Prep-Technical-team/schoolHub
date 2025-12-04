// app/student/classes/data/classesData.ts
export interface ClassItem {
  id: number
  title: string
  subject: string
  teacher: string
  progress: number
  assignmentsDue: number
  nextClass: string
  status: 'active' | 'completed' | 'upcoming'
  color: 'green' | 'orange' | 'gray'
}

export const classesData: ClassItem[] = [
  {
    id: 1,
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    teacher: 'Dr. Emily Carter',
    progress: 65,
    assignmentsDue: 3,
    nextClass: 'Tue, Oct 26 @ 10:00 AM',
    status: 'active',
    color: 'green'
  },
  {
    id: 2,
    title: 'World History: 1500-Present',
    subject: 'History',
    teacher: 'Prof. David Chen',
    progress: 25,
    assignmentsDue: 1,
    nextClass: 'Wed, Oct 27 @ 2:00 PM',
    status: 'active',
    color: 'orange'
  },
  {
    id: 3,
    title: 'Fundamentals of Physics',
    subject: 'Science',
    teacher: 'Dr. Olivia Reed',
    progress: 95,
    assignmentsDue: 0,
    nextClass: 'Thu, Oct 28 @ 9:00 AM',
    status: 'active',
    color: 'green'
  },
  {
    id: 4,
    title: 'Creative Writing Workshop',
    subject: 'Literature',
    teacher: 'Prof. Liam Smith',
    progress: 40,
    assignmentsDue: 1,
    nextClass: 'Mon, Nov 1 @ 1:00 PM',
    status: 'active',
    color: 'orange'
  },
  {
    id: 5,
    title: 'Introduction to Python',
    subject: 'Computer Science',
    teacher: 'Dr. Anya Sharma',
    progress: 100,
    assignmentsDue: 0,
    nextClass: 'Course completed!',
    status: 'completed',
    color: 'gray'
  },
  {
    id: 6,
    title: 'Digital Marketing',
    subject: 'Business',
    teacher: 'Prof. Marcus Bell',
    progress: 0,
    assignmentsDue: 1,
    nextClass: 'First Class: Tue, Nov 2 @ 11:00 AM',
    status: 'upcoming',
    color: 'gray'
  },
]