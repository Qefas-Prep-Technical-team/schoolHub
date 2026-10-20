"use client"

import Link from "next/link"
import { useParentDashboard } from "@/lib/api/hooks/useParentDashboard"
import { useParentStore } from "@/lib/api/hooks/useParentStore"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderTooltip } from "@/app/dashboard/parent/components/dashboard/HeaderTooltip"
import { 
  TrendingUp, 
  CalendarCheck, 
  GraduationCap, 
  Award, 
  LucideIcon
} from "lucide-react"

interface StatCardItem {
  title: string
  value: string
  subValue: string
  description: string
  tooltip: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  borderColor: string
  link: string
  actionLabel: string
}

export default function StatCards() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  
  if (isLoading) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 sm:h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        ))}
      </section>
    )
  }

  const stats = data?.stats
  const child = data?.child
  const avg = Math.round(stats?.averageGrade ?? 0)

  const gradeLabel = (score: number) => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  const statCards: StatCardItem[] = [
    {
      title: 'Term Average',
      value: `${avg}%`,
      subValue: `Grade ${gradeLabel(avg)}`,
      description: 'Weighted Performance',
      tooltip: `Cumulative average score across all graded continuous assessments, homework assignments, and examinations for ${child?.name || 'this student'}. Compare this percentage against the 75% benchmark to verify if academic standing meets promotion thresholds.`,
      icon: TrendingUp,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'group-hover:border-orange-500/40',
      link: '/dashboard/parent/exams&results/analytics',
      actionLabel: 'Analytics'
    },
    {
      title: 'Attendance',
      value: `${Math.round(stats?.attendanceRate ?? 0)}%`,
      subValue: (stats?.attendanceRate ?? 0) >= 90 ? 'Excellent' : 'Fair',
      description: 'Term Consistency',
      tooltip: `Recorded attendance rate for ${child?.name || 'this student'} during the current school term. Consistent presence above 90% is strongly correlated with superior concept retention and exam scores.`,
      icon: CalendarCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'group-hover:border-emerald-500/40',
      link: '/dashboard/parent/attendance',
      actionLabel: 'Attendance'
    },
    {
      title: 'Current Class',
      value: child?.currentClass?.name || 'Assigned',
      subValue: child?.currentClass?.section ? `Sec: ${child.currentClass.section}` : 'Active Cohort',
      description: 'Enrolled Cohort',
      tooltip: `The student's officially enrolled classroom cohort and stream. All scheduled test papers, quizzes, and continuous assessments are calibrated against this class curriculum.`,
      icon: GraduationCap,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'group-hover:border-blue-500/40',
      link: '/dashboard/parent/class',
      actionLabel: 'Classroom'
    },
    {
      title: 'Graded Records',
      value: `${child?.recentGrades?.length || 0}`,
      subValue: 'Evaluations',
      description: 'Continuous Marks',
      tooltip: `Total volume of individual graded deliverables (homework submissions, quizzes, continuous assessments, and exam papers) recorded by teachers during this evaluation cycle.`,
      icon: Award,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'group-hover:border-purple-500/40',
      link: '/dashboard/parent/exams&results/report-card',
      actionLabel: 'Dashboard Report'
    }
  ]

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Link
            href={stat.link}
            key={index}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between group ${stat.borderColor}`}
          >
            <div className="flex justify-between items-center mb-2.5">
              <div className={`size-8 sm:size-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                <IconComponent size={17} strokeWidth={2.2} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full truncate">
                {stat.subValue}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {stat.title}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {stat.value}
              </h3>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
