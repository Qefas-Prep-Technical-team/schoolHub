import { ClipboardList, BarChart2, Award } from 'lucide-react'

interface OverviewWidgetsProps {
  totalAssessments: number
  averageScore: number
  highestScore: number
}

export default function OverviewWidgets({ totalAssessments, averageScore, highestScore }: OverviewWidgetsProps) {
  const widgets = [
    {
      id: 1,
      title: 'Total Graded',
      value: (totalAssessments ?? 0).toString(),
      subtitle: 'Recorded Assessments',
      icon: ClipboardList,
      color: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'hover:border-blue-500/50',
      },
    },
    {
      id: 2,
      title: 'Average Score',
      value: `${averageScore ?? 0}%`,
      subtitle: 'Overall Performance',
      icon: BarChart2,
      color: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'hover:border-orange-500/50',
      },
    },
    {
      id: 3,
      title: 'Highest Score',
      value: `${highestScore ?? 0}%`,
      subtitle: 'Top Achievement',
      icon: Award,
      color: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'hover:border-emerald-500/50',
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {widgets.map((widget) => {
        const Icon = widget.icon
        const color = widget.color

        return (
          <div
            key={widget.id}
            className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between group transition-colors ${color.border}`}
          >
            <div className="flex flex-col gap-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {widget.title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {widget.value}
                </h3>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                {widget.subtitle}
              </p>
            </div>

            <div className={`p-3 rounded-xl ${color.bg} ${color.text} transition-transform group-hover:scale-110`}>
              <Icon className="size-6" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
