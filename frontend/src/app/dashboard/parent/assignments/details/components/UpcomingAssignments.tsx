import { Card } from './ui/Card'

interface UpcomingAssignment {
  id: number
  title: string
  dueDate: string
  type: 'quiz' | 'reading'
}

const upcomingAssignments: UpcomingAssignment[] = [
  { id: 1, title: 'Midterm Exam Review', dueDate: 'Oct 30', type: 'quiz' },
  { id: 2, title: 'Read: The Gilded Age', dueDate: 'Nov 02', type: 'reading' },
]

export default function UpcomingAssignments() {
  return (
    <Card>
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Upcoming in History 101
        </h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {upcomingAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary mb-1">
              {assignment.title}
            </p>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Due {assignment.dueDate}</span>
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                {assignment.type === 'quiz' ? 'Quiz' : 'Reading'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}