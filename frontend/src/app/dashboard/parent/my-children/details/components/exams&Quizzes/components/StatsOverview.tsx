import { TrendingUp, CheckCircle2, Calendar } from 'lucide-react'

interface StatItem {
  id: number
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  iconColor: string
  bgColor: string
  textColor: string
}

const stats: StatItem[] = [
  {
    id: 1,
    title: 'Average Score',
    value: '88%',
    subtitle: '+2.4% vs last term',
    icon: <TrendingUp className="size-5" />,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 2,
    title: 'Completed',
    value: '12',
    subtitle: 'Assessments this term',
    icon: <CheckCircle2 className="size-5" />,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
  },
  {
    id: 3,
    title: 'Next Exam',
    value: 'Math',
    subtitle: 'Oct 24 • 09:00 AM',
    icon: <Calendar className="size-5" />,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
]

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="flex flex-col gap-1 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-sec-light dark:text-text-sec-dark">
              {stat.title}
            </p>
            <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-3xl font-bold text-text-main-light dark:text-text-main-dark truncate">
            {stat.value}
          </p>
          <p className={`text-xs font-medium ${stat.textColor}`}>
            {stat.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}