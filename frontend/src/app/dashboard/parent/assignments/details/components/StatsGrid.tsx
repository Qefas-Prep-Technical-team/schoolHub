import { CalendarCheck, CalendarX, CheckCircle } from 'lucide-react'

interface StatItem {
  id: number
  title: string
  value: string
  icon: React.ReactNode
  color: string
  highlight?: boolean
}

const stats: StatItem[] = [
  {
    id: 1,
    title: 'Assigned Date',
    value: 'Oct 10, 2023',
    icon: <CalendarCheck className="size-5" />,
    color: 'text-slate-400',
  },
  {
    id: 2,
    title: 'Due Date',
    value: 'Oct 24, 2023',
    icon: <CalendarX className="size-5" />,
    color: 'text-slate-400',
  },
  {
    id: 3,
    title: 'Status',
    value: 'Complete',
    icon: <CheckCircle className="size-5" />,
    color: 'text-emerald-500',
  },
  {
    id: 4,
    title: 'Current Score',
    value: '85 / 100',
    icon: null,
    color: 'text-primary dark:text-blue-400',
    highlight: true,
  },
]

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`p-5 rounded-xl border shadow-sm flex flex-col gap-1 relative overflow-hidden ${
            stat.highlight
              ? 'border-primary/20 bg-primary/5 dark:bg-primary/10'
              : 'bg-card-light dark:bg-card-dark border-slate-200 dark:border-slate-800'
          }`}
        >
          {stat.highlight && (
            <div className="absolute -right-4 -top-4 bg-primary/10 rounded-full size-20"></div>
          )}
          
          <p className={`text-sm font-medium ${
            stat.highlight 
              ? 'text-primary dark:text-blue-400 font-bold' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            {stat.title}
          </p>
          
          <div className="flex items-center gap-2">
            {stat.icon && <span className={stat.color}>{stat.icon}</span>}
            <p className="text-slate-900 dark:text-white text-lg font-bold">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}