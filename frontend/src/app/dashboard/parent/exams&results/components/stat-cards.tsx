"use client"

import Link from "next/link"
import { useParentDashboard } from "@/lib/api/hooks/useParentDashboard"
import { useParentStore } from "@/lib/api/hooks/useParentStore"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCard {
  title: string
  value: string
  description: string
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
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
      icon: 'analytics',
      iconColor: 'bg-orange-500',
      trend: { value: 'View Details', isPositive: true }
    },
    {
      title: 'Attendance',
      value: `${stats?.attendanceRate ?? 0}%`,
      description: 'Term Presence',
      icon: 'calendar_today',
      iconColor: 'bg-amber-500',
      trend: { value: 'View Details', isPositive: true }
    },
    {
      title: 'Current Class',
      value: child?.currentClass?.name || 'N/A',
      description: child?.currentClass?.section ? `Section: ${child.currentClass.section}` : 'Academic Session',
      icon: 'school',
      iconColor: 'bg-red-500',
      trend: { value: 'View Details', isPositive: true }
    },
    {
      title: 'Recent Grades',
      value: child?.recentGrades?.length.toString() || '0',
      description: 'Latest assessments',
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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((stat, index) => (
        <Link
          href={`${handleLink(stat.title)}`}
          key={index}
          className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] group"
        >
          <div className="flex justify-between items-start">
            <div className={`w-12 h-12 rounded-full ${stat.iconColor} flex items-center justify-center text-white shadow-md`}>
              <span className="material-symbols-outlined text-[24px]">
                {stat.icon}
              </span>
            </div>
            {stat.trend && (
              <span className="text-[11px] font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full">
                {stat.trend.value}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{stat.value}</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">{stat.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
}

