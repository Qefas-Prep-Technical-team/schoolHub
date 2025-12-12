import { Calculator, Beaker, PenTool } from 'lucide-react'
import { Card } from './ui/Card'

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  dueDate: string
  dueTime: string
  status: 'urgent' | 'upcoming' | 'future'
  icon: React.ReactNode
  color: string
}

const assignments: Assignment[] = [
  {
    id: '1',
    title: 'Mathematics Worksheet: Algebra',
    description: 'Chapter 4 - Intro to variables',
    subject: 'Math',
    dueDate: 'Oct 24',
    dueTime: '2:00 PM',
    status: 'urgent',
    icon: <Calculator className="size-5" />,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-primary group-hover:text-white',
  },
  {
    id: '2',
    title: 'Science Project: Solar System',
    description: 'Model submission & presentation',
    subject: 'Science',
    dueDate: 'Oct 27',
    dueTime: '9:00 AM',
    status: 'upcoming',
    icon: <Beaker className="size-5" />,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white',
  },
  {
    id: '3',
    title: 'History Essay Draft',
    description: 'The Industrial Revolution',
    subject: 'History',
    dueDate: 'Oct 30',
    dueTime: '11:59 PM',
    status: 'future',
    icon: <PenTool className="size-5" />,
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white',
  },
]

export default function UpcomingAssignments() {
  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'urgent':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
      case 'upcoming':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
      case 'future':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
    }
  }

  const getStatusText = (status: Assignment['status']) => {
    switch (status) {
      case 'urgent':
        return 'Due Tomorrow'
      case 'upcoming':
        return 'Due Friday'
      case 'future':
        return 'Due Monday'
      default:
        return 'Due'
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="text-primary" />
          Due this Week
        </h3>
        <a href="#" className="text-sm text-primary font-medium hover:underline">
          View All
        </a>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-primary/30 transition-colors group"
          >
            <div className={`rounded-lg p-2.5 mr-4 transition-colors ${assignment.color}`}>
              {assignment.icon}
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {assignment.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {assignment.description}
              </p>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getStatusColor(assignment.status)}`}>
                {getStatusText(assignment.status)}
              </span>
              <span className="text-xs text-slate-400">
                {assignment.dueDate}, {assignment.dueTime}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}