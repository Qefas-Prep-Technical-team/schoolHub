import { Card } from './ui/Card'
import { Award } from 'lucide-react'

interface Grade {
  id: string
  subject: string
  title: string
  date: string
  score: string
  grade: string
  color: string
}

const grades: Grade[] = [
  {
    id: '1',
    subject: 'English',
    title: 'English Quiz 2',
    date: 'Yesterday',
    score: '92/100',
    grade: 'A',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    id: '2',
    subject: 'Math',
    title: 'Math Homework',
    date: 'Oct 20',
    score: '85/100',
    grade: 'B',
    color: 'text-primary',
  },
  {
    id: '3',
    subject: 'Science',
    title: 'Science Lab',
    date: 'Oct 18',
    score: '98/100',
    grade: 'A+',
    color: 'text-green-600 dark:text-green-400',
  },
]

export default function RecentGrades() {
  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Award className="text-primary" />
        Recent Grades
      </h3>

      <div className="space-y-4">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {grade.title}
              </p>
              <p className="text-xs text-slate-500">{grade.date}</p>
            </div>
            <div className="text-right">
              <span className={`block font-bold ${grade.color}`}>
                {grade.score}
              </span>
              <span className="text-xs text-slate-400">{grade.grade}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
        View Full Report
      </button>
    </Card>
  )
}