import { CalendarClock, Hourglass, AlertTriangle } from 'lucide-react'

interface Widget {
  id: number
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color: 'orange' | 'blue' | 'red'
}

const widgets: Widget[] = [
  {
    id: 1,
    title: 'Due This Week',
    value: 5,
    description: '2 Urgent',
    icon: <CalendarClock className="size-6" />,
    color: 'orange',
  },
  {
    id: 2,
    title: 'Pending Total',
    value: 12,
    description: 'Across 4 subjects',
    icon: <Hourglass className="size-6" />,
    color: 'blue',
  },
  {
    id: 3,
    title: 'Late Assignments',
    value: 1,
    description: 'Requires Attention',
    icon: <AlertTriangle className="size-6" />,
    color: 'red',
  },
]

const colorConfig = {
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-500',
    border: 'hover:border-orange-200 dark:hover:border-orange-900/50',
    description: 'text-orange-500',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-primary',
    border: 'hover:border-blue-200 dark:hover:border-blue-900/50',
    description: 'text-slate-400 dark:text-slate-500',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-500',
    border: 'hover:border-red-200 dark:hover:border-red-900/50',
    description: 'text-red-500',
  },
}

export default function OverviewWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {widgets.map((widget) => {
        const color = colorConfig[widget.color]
        
        return (
          <div
            key={widget.id}
            className={`bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between group transition-colors ${color.border}`}
          >
            <div className="flex flex-col gap-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {widget.title}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {widget.value}
              </p>
              <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${color.description}`}>
                {widget.color === 'orange' && (
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                )}
                {widget.color === 'red' && (
                  <span className="material-symbols-outlined text-[14px]">error</span>
                )}
                {widget.description}
              </p>
            </div>
            
            <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
              {widget.icon}
            </div>
          </div>
        )
      })}
    </div>
  )
}