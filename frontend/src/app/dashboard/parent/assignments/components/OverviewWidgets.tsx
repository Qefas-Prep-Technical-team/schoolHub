import React from 'react'
import { ClipboardList, Award, Clock, CheckCircle2 } from 'lucide-react'
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip'

interface OverviewWidgetsProps {
  totalAssessments: number;
  gradedCount?: number;
  averageScore: number;
  pendingCount?: number;
}

export default function OverviewWidgets({ 
  totalAssessments, 
  gradedCount = 0,
  averageScore, 
  pendingCount = 0 
}: OverviewWidgetsProps) {
  const widgets = [
    {
      id: 1,
      title: 'Total Deliverables',
      value: (totalAssessments ?? 0).toString(),
      subtitle: 'Assigned Coursework',
      tooltip: 'Total volume of assignments, homework questions, and projects published by teachers for this student.',
      icon: ClipboardList,
      color: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'hover:border-blue-500/40',
      },
    },
    {
      id: 2,
      title: 'Graded & Scored',
      value: (gradedCount ?? 0).toString(),
      subtitle: 'Feedback Received',
      tooltip: 'Number of submitted tasks that have been reviewed, graded, and returned by course instructors with performance scores.',
      icon: CheckCircle2,
      color: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'hover:border-emerald-500/40',
      },
    },
    {
      id: 3,
      title: 'Assignment Average',
      value: `${Math.round(averageScore ?? 0)}%`,
      subtitle: 'Continuous Assessment',
      tooltip: 'Cumulative average score across all graded assignments. Use this to gauge your child’s routine homework mastery.',
      icon: Award,
      color: {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'hover:border-orange-500/40',
      },
    },
    {
      id: 4,
      title: 'Action Required',
      value: (pendingCount ?? 0).toString(),
      subtitle: 'Due or In Progress',
      tooltip: 'Current assignments that are pending submission or awaiting completion before their specified deadlines.',
      icon: Clock,
      color: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'hover:border-purple-500/40',
      },
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {widgets.map((widget) => {
        const Icon = widget.icon
        const color = widget.color

        return (
          <div
            key={widget.id}
            className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-[22px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between group transition-all duration-300 ${color.border} hover:shadow-md`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {widget.title}
                </p>
                <HeaderTooltip content={widget.tooltip} size={11} />
              </div>
              <div className={`p-2 rounded-xl ${color.bg} ${color.text} shrink-0`}>
                <Icon className="size-4 sm:size-5" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {widget.value}
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                {widget.subtitle}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
