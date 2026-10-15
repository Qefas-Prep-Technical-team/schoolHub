'use client'

import { cn } from '@/lib/utils'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import Link from 'next/link'
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react'

export default function AttendanceCard() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const attendanceRate = data?.stats?.attendanceRate ?? 0
  const breakdown = data?.stats?.attendanceBreakdown ?? []

  const bars = breakdown.slice(-10).map(b => ({ height: b.present ? 100 : 30, present: b.present }))
  while (bars.length < 10) bars.unshift({ height: 50, present: true })
  
  const trendLabel = attendanceRate >= 90 ? '+Great' : attendanceRate >= 70 ? 'Avg' : 'Low'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer relative group">
      <Link href="/dashboard/parent/attendance" className="absolute inset-0 z-10" />
      {/* Top Header Section */}
      <div className="bg-blue-500 p-3 sm:p-4 flex items-center justify-between">
        <span className="text-white font-bold text-xs sm:text-[15px] tracking-wide truncate">Attendance</span>
        <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg shrink-0">
          <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
      </div>
      
      {/* Bottom Content Section */}
      <div className="p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-4 flex-1 justify-between">
        <div className="flex items-center justify-between gap-1">
          <div>
            {isLoading ? <Skeleton className="h-7 sm:h-9 w-14 sm:w-20 mb-1" /> : (
              <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-none block">{attendanceRate}%</span>
            )}
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 block">Present</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1 uppercase tracking-widest",
              attendanceRate >= 90 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : 
              attendanceRate >= 70 ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10" : 
              "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
            )}>
              {attendanceRate >= 70 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {trendLabel}
            </span>
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="flex items-end gap-[2px] sm:gap-[3px] h-8 sm:h-12 w-full pt-1">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-sm bg-slate-100 dark:bg-slate-800" style={{ height: '60%' }} />
              ))
            : bars.map((bar, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1 rounded-sm transition-all duration-500 group-hover:bg-blue-500",
                    !bar.present ? "bg-slate-200 dark:bg-slate-700" : "bg-blue-400/30 dark:bg-blue-500/40"
                  )}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
