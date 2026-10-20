"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParentDashboard, UpcomingExam } from "@/lib/api/hooks/useParentDashboard"
import { useParentStore } from "@/lib/api/hooks/useParentStore"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { HeaderTooltip } from "@/app/dashboard/parent/components/dashboard/HeaderTooltip"
import { CalendarDays, CalendarX, ArrowRight, BarChart3, HelpCircle } from "lucide-react"

export default function SidebarRight() {
  const { selectedChildId } = useParentStore()
  const { data: dashboardData, isLoading } = useParentDashboard(selectedChildId)

  const upcomingExams = useMemo(() => {
    return (dashboardData?.upcomingExams || []).map((exam: UpcomingExam) => {
      const examDate = exam.startDate ? new Date(exam.startDate) : new Date()
      return {
        id: exam.id,
        month: format(examDate, 'MMM').toUpperCase(),
        day: format(examDate, 'dd'),
        title: exam.title,
        subject: exam.subject?.name || 'General Subject',
        time: format(examDate, 'hh:mm a')
      }
    })
  }, [dashboardData])

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-3.5 sm:gap-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  const gradingScales = [
    { grade: 'A+', range: '90 - 100%', label: 'Distinction', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20' },
    { grade: 'A', range: '80 - 89%', label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20' },
    { grade: 'B', range: '70 - 79%', label: 'Very Good', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-500/20' },
    { grade: 'C', range: '60 - 69%', label: 'Credit', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20' },
    { grade: 'D', range: '50 - 59%', label: 'Pass', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-500/20' },
    { grade: 'F', range: '< 50%', label: 'Needs Help', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-500/20' },
  ]

  return (
    <div className="w-full flex flex-col gap-3.5 sm:gap-4">
      {/* 1. Upcoming Papers & Assessments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={15} className="text-orange-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Upcoming Papers
            </h3>
            <HeaderTooltip
              content="Upcoming examination papers, test sittings, and continuous assessment deadlines scheduled for this student's class cohort."
              size={13}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {upcomingExams.length} Scheduled
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {upcomingExams.slice(0, 4).map((exam, index) => (
            <div
              key={exam.id || index}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex flex-col items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 rounded-xl size-10 shrink-0 border border-orange-500/15">
                <span className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase leading-none">
                  {exam.month}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none mt-0.5">
                  {exam.day}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                  {exam.title}
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {exam.subject} • {exam.time}
                </p>
              </div>
            </div>
          ))}

          {upcomingExams.length === 0 && (
            <div className="text-center py-5">
              <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-1.5">
                <CalendarX size={16} />
              </div>
              <p className="text-xs font-medium text-slate-400">No upcoming exam papers scheduled</p>
            </div>
          )}
        </div>

        <Link href="/dashboard/parent/exams&results/calender" className="block w-full mt-3.5">
          <button className="w-full py-2 rounded-xl bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-orange-600 dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
            <span>Full Exam Calendar</span>
            <ArrowRight size={12} />
          </button>
        </Link>
      </div>

      {/* 2. Grading Scale Reference Guide */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={15} className="text-orange-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Grading Key
            </h3>
            <HeaderTooltip
              content="Standardized academic performance benchmarks and grading scale. Used across all tests, continuous assessments, and official terminal examination results."
              size={13}
            />
          </div>
          <Link
            href="/dashboard/parent/exams&results/analytics"
            className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 uppercase tracking-wider"
          >
            <span>Analytics</span>
            <ArrowRight size={10} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {gradingScales.map((item) => (
            <div
              key={item.grade}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`flex items-center justify-center size-5 rounded-md font-black text-[10px] shrink-0 border ${item.color}`}>
                  {item.grade}
                </span>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1">
                {item.range}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium">Promotion Benchmark:</span>
          <span className="font-bold text-slate-900 dark:text-white">50% Minimum</span>
        </div>

        <Link href="/dashboard/parent/exams&results/analytics" className="block w-full mt-3">
          <button className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-500 hover:text-orange-600 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs">
            <BarChart3 size={13} />
            <span>Subject Radar &amp; Trends</span>
          </button>
        </Link>
      </div>
    </div>
  )
}

