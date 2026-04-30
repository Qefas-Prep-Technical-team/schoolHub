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
      accentColor: 'bg-orange-500'
    },
    {
      title: 'Attendance',
      value: `${stats?.attendanceRate ?? 0}%`,
      description: 'Term Presence',
      icon: 'calendar_today',
      progress: stats?.attendanceRate ?? 0
    },
    {
      title: 'Current Class',
      value: child?.currentClass?.name || 'N/A',
      description: child?.currentClass?.section ? `Section: ${child.currentClass.section}` : 'Academic Session',
      icon: 'school',
    },
    {
      title: 'Recent Grades',
      value: child?.recentGrades?.length.toString() || '0',
      description: 'Latest assessments',
      icon: 'grade',
      iconColor: 'text-orange-500'
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
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-44 relative overflow-hidden group"
        >
          {/* Accent bar */}
          {stat.accentColor && (
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.accentColor}`}></div>
          )}
          
          {/* Background icon */}
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-orange-600">
              {stat.icon}
            </span>
          </div>

          <div className="flex justify-between items-start z-10">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.title}</p>
            {stat.trend && (
              <span className={`${
                stat.trend.isPositive 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-red-500/10 text-red-600'
              } text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-tight`}>
                {stat.trend.value}
              </span>
            )}
            {stat.iconColor && !stat.trend && (
              <span className={`material-symbols-outlined text-[20px] ${stat.iconColor}`}>
                {stat.icon}
              </span>
            )}
          </div>

          <div className="z-10">
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {stat.value}
            </p>
            <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-1">{stat.description}</p>
            
            {stat.progress !== undefined && (
              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${stat.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </section>
  )
}

