import { TrendingUp, Calendar } from 'lucide-react'

const stats = [
  {
    id: 1,
    title: 'Overall GPA',
    value: '3.8',
    trend: '+0.2',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    id: 2,
    title: 'Attendance',
    value: '96%',
    trend: 'Excellent',
    icon: Calendar,
    color: 'text-green-600',
  },
]

export default function MiniStats() {
  return (
    <div className="flex gap-4 lg:w-auto w-full overflow-x-auto pb-2 lg:pb-0">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.id}
            className="min-w-[160px] flex-1 bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark mb-2">
              <Icon className="size-5" />
              <span className="text-sm font-medium">{stat.title}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">
                {stat.value}
              </span>
              <span className={`${stat.color} text-sm font-medium mb-1`}>
                {stat.trend}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}