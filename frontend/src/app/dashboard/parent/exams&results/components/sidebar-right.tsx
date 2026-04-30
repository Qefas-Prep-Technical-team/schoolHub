"use client"

import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js"

import { useMemo } from "react"
import Link from "next/link"
import { useParentDashboard } from "@/lib/api/hooks/useParentDashboard"
import { useParentStore } from "@/lib/api/hooks/useParentStore"
import { useChildExams } from "@/lib/api/hooks/useChildExams"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

export default function SidebarRight() {
  const { selectedChildId } = useParentStore()
  const { data: dashboardData, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId)
  const { data: childDetails, isLoading: isDetailsLoading } = useChildExams(selectedChildId)

  const isLoading = isDashboardLoading || isDetailsLoading

  const upcomingExams = useMemo(() => {
    return (dashboardData?.upcomingExams || []).map((exam: any) => ({
      month: format(new Date(exam.startDate), 'MMM').toUpperCase(),
      day: format(new Date(exam.startDate), 'dd'),
      title: exam.title,
      subject: exam.subject?.name || 'General',
      time: format(new Date(exam.startDate), 'hh:mm a')
    }))
  }, [dashboardData])

  const subjectPerformance = useMemo(() => {
    const grades = childDetails?.grades || []
    const subjectsMap: Record<string, { total: number, count: number }> = {}

    grades.forEach((g: any) => {
      const sub = g.subject || g.subjectPaper?.subject?.name || 'Unknown'
      const percentage = (g.score / g.maxMarks) * 100
      if (!subjectsMap[sub]) {
        subjectsMap[sub] = { total: 0, count: 0 }
      }
      subjectsMap[sub].total += percentage
      subjectsMap[sub].count += 1
    })

    return Object.entries(subjectsMap).map(([subject, data]) => ({
      subject,
      score: Math.round(data.total / data.count)
    })).slice(0, 5) // Top 5 subjects for radar
  }, [childDetails])

  const chartData = useMemo(() => {
    return {
      labels: subjectPerformance.length > 0 ? subjectPerformance.map((s) => s.subject) : ["Math", "Science", "English"],
      datasets: [
        {
          label: "Performance",
          data: subjectPerformance.length > 0 ? subjectPerformance.map((s) => s.score) : [80, 70, 90],
          backgroundColor: "rgba(234, 88, 12, 0.2)", // orange-600/20
          borderColor: "rgba(234, 88, 12, 1)",      // orange-600
          borderWidth: 2,
          pointBackgroundColor: "rgba(234, 88, 12, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(234, 88, 12, 1)"
        }
      ]
    }
  }, [subjectPerformance])

  const chartOptions = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false, stepSize: 20 },
        grid: { color: "rgba(0,0,0,0.05)" },
        angleLines: { color: "rgba(0,0,0,0.05)" },
        pointLabels: {
          font: { size: 9, weight: 'bold', family: 'Inter' },
          color: "#94a3b8"
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 11, weight: 'bold' },
        bodyFont: { size: 10 },
        padding: 10,
        displayColors: false
      }
    }
  }

  if (isLoading) {
    return (
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">

      {/* Performance Radar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Performance Radar</h3>
          <Link href="/dashboard/parent/exams&results/analytics" className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline">
            Details
          </Link>
        </div>

        <div className="w-full h-60 flex items-center justify-center">
          <Radar data={chartData} options={chartOptions as any} />
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {subjectPerformance.map((item) => (
            <div key={item.subject} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{item.subject}</span>
              <span className="text-[12px] font-black text-slate-900 dark:text-white">{item.score}%</span>
            </div>
          ))}
          {subjectPerformance.length === 0 && (
            <p className="text-[10px] text-slate-400 text-center italic py-4">No performance data yet</p>
          )}
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">Upcoming Exams</h3>

        <div className="flex flex-col gap-4">
          {upcomingExams.map((exam, index) => (
            <div key={index} className="flex gap-4 items-center group cursor-pointer p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <div className="flex flex-col items-center justify-center bg-orange-600/10 dark:bg-orange-600/20 rounded-xl size-12 shrink-0 border border-orange-500/10">
                <span className="text-[9px] font-black text-orange-600 uppercase leading-none">{exam.month}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{exam.day}</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-900 dark:text-white text-[13px] truncate tracking-tight">
                  {exam.title}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                  {exam.subject} • {exam.time}
                </p>
              </div>
            </div>
          ))}
          {upcomingExams.length === 0 && (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">event_busy</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">No upcoming exams</p>
            </div>
          )}
        </div>
        
        <Link href="/dashboard/parent/exams&results/calender" className="block w-full mt-6">
          <button className="w-full py-3.5 rounded-2xl bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-95">
            Full Schedule
          </button>
        </Link>
      </div>
    </div>
  )
}

