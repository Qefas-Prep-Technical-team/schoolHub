// app/student/classes/[id]/components/ClassStats.tsx
import { CheckCircle, Calendar, TrendingUp, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ClassStatsProps {
  attendance: number
  assignments: { completed: number; total: number }
  grade: string
  lastActivity: string
}

export default function ClassStats({ 
  attendance, 
  assignments, 
  grade, 
  lastActivity 
}: ClassStatsProps) {
  const stats = [
    {
      icon: CheckCircle,
      value: `${attendance}%`,
      label: 'Attendance',
      color: 'text-blue-600'
    },
    {
      icon: Calendar,
      value: `${assignments.completed}/${assignments.total}`,
      label: 'Assignments',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      value: grade,
      label: 'Grade',
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      value: lastActivity,
      label: 'Last Activity',
      color: 'text-amber-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className={`mb-2 ${stat.color}`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}