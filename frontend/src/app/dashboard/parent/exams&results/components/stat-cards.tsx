"use client"

import Link from "next/link"
import { useParentDashboard } from "@/lib/api/hooks/useParentDashboard"
import { useParentStore } from "@/lib/api/hooks/useParentStore"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderTooltip } from "@/app/dashboard/parent/components/dashboard/HeaderTooltip"

interface StatCard {
  title: string
  value: string
  description: string
  tooltip: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon: string
  iconColor?: string
  progress?: number
  accentColor?: string
}

export default function StatCards() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  
  if (isLoading) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 sm:h-40 rounded-2xl" />
        ))}
      </section>
    )
  }

  const stats = data?.stats
  const child = data?.child
  const avg = stats?.averageGrade ?? 0

  const gradeLabel = (avg: number) => {
    if (avg >= 90) return 'A+'
    if (avg >= 80) return 'A'
    if (avg >= 70) return 'B'
    if (avg >= 60) return 'C'
    if (avg >= 50) return 'D'
    return 'F'
  }

  const statCards: StatCard[] = [
    {
      title: 'Term Average',
      value: `${avg}%`,
      description: `Grade: ${gradeLabel(avg)}`,
      tooltip: "Cumulative average score across all graded continuous assessments and exams for the active school term. Use this to gauge whether overall performance meets grade-level benchmark expectations.",
      icon: 'analytics',
      iconColor: 'bg-orange-500',
      trend: { value: 'View Details', isPositive: true }
    },
    {
      title: 'Attendance',
      value: `${stats?.attendanceRate ?? 0}%`,
      description: 'Term Presence',
      tooltip: "Recorded attendance percentage for the current academic term. High attendance strongly correlates with superior exam retention and assessment scores.",
      icon: 'calendar_today',
      iconColor: 'bg-amber-500',
      trend: { value: 'View Details', isPositive: true }
    },
    {
      title: 'Current Class',
      value: child?.currentClass?.name || 'N/A',
      description: child?.currentClass?.section ? `Section: ${child.currentClass.section}` : 'Academic Session',
      tooltip: "The student's officially enrolled class section and academic stream. Curricula and assessment weighting vary depending on the stream.",
      icon: 'school',
      iconColor: 'bg-red-500',
      trend: { value: 'View Details', isPositive: true }
    },
    {
      title: 'Recent Grades',
      value: child?.recentGrades?.length.toString() || '0',
      description: 'Latest marks',
      tooltip: "Total count of recently recorded marks and teacher evaluations during this evaluation period. Review these to track day-to-day homework and quiz mastery.",
      icon: 'grade',
      iconColor: 'bg-yellow-500',
      trend: { value: 'View Details', isPositive: true }
    }
  ]

  const handleLink = (type: string) => {
    switch (type) {
      case "Term Average":
        return "/dashboard/parent/exams&results/analytics";
      case "Current Class":
        return "/dashboard/parent/exams&results/report-card";
      default:
        return "#";
    }
  }

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
      {statCards.map((stat, index) => (
        <Link
          href={`${handleLink(stat.title)}`}
          key={index}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[135px] sm:min-h-[160px] group"
        >
          <div className="flex justify-between items-start gap-1">
            <div className={`size-8 sm:size-11 rounded-xl sm:rounded-2xl ${stat.iconColor} flex items-center justify-center text-white shadow-md shrink-0`}>
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">
                {stat.icon}
              </span>
            </div>
            {stat.trend && (
              <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full truncate">
                {stat.trend.value}
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{stat.title}</p>
              <div onClick={(e) => e.preventDefault()}>
                <HeaderTooltip content={stat.tooltip} size={13} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-2">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">{stat.value}</h3>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 sm:mb-1 uppercase tracking-wider truncate">{stat.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
}

