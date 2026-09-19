import { CheckCircle, Calendar, TrendingUp, Clock, BookOpen, Award, Flame } from 'lucide-react'

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
      icon: BookOpen,
      value: `${assignments.completed}/${assignments.total}`,
      label: 'Assignments Done',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Award,
      value: grade,
      label: 'Current Grade',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500'
    },
    {
      icon: CheckCircle,
      value: `${attendance}%`,
      label: 'Attendance Rate',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Flame,
      value: lastActivity === 'No activity yet' ? '0' : '1',
      label: 'Active Streak',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
             </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">
              {stat.label}
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white leading-none">
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}