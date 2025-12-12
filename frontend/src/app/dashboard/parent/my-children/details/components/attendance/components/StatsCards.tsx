import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'

interface StatCard {
  id: number
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: string
  progress?: number
  trend?: string
}

const stats: StatCard[] = [
  {
    id: 1,
    title: 'Attendance Rate',
    value: '96%',
    subtitle: '+2%',
    icon: <TrendingUp className="size-5" />,
    color: 'primary',
    progress: 96,
    trend: '+2%',
  },
  {
    id: 2,
    title: 'Present Days',
    value: '45',
    subtitle: 'Total this term',
    icon: <CheckCircle className="size-5" />,
    color: 'emerald',
  },
  {
    id: 3,
    title: 'Absent Days',
    value: '2',
    subtitle: 'Excused absences',
    icon: <XCircle className="size-5" />,
    color: 'rose',
  },
  {
    id: 4,
    title: 'Late Arrivals',
    value: '1',
    subtitle: 'Avg. 15 mins late',
    icon: <Clock className="size-5" />,
    color: 'amber',
  },
]

const colorClasses = {
  primary: {
    bg: 'bg-primary',
    text: 'text-primary',
    lightBg: 'bg-primary/20 dark:bg-primary/30',
    lightText: 'text-primary',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    lightText: 'text-emerald-500 dark:text-emerald-400',
  },
  rose: {
    bg: 'bg-rose-500',
    text: 'text-rose-500',
    lightBg: 'bg-rose-50 dark:bg-rose-900/20',
    lightText: 'text-rose-500 dark:text-rose-400',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    lightBg: 'bg-amber-50 dark:bg-amber-900/20',
    lightText: 'text-amber-500 dark:text-amber-400',
  },
}

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses]

        if (stat.id === 1) {
          // Special card with progress bar
          return (
            <div
              key={stat.id}
              className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group"
            >
              {/* Background Icon */}
              <div className="absolute right-[-10px] top-[-10px] opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[100px] text-primary">percent</span>
              </div>
              
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                {stat.trend && (
                  <span className="text-xs font-medium text-emerald-500 mb-2 flex items-center">
                    <TrendingUp className="size-3 mr-1" />
                    {stat.trend}
                  </span>
                )}
              </div>
              
              {/* Progress Bar */}
              {stat.progress && (
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )
        }

        // Regular stat cards
        return (
          <div
            key={stat.id}
            className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
              <p className="text-xs text-gray-400">{stat.subtitle}</p>
            </div>
            
            <div className={`size-12 rounded-full ${colors.lightBg} flex items-center justify-center ${colors.lightText}`}>
              {stat.icon}
            </div>
          </div>
        )
      })}
    </div>
  )
}