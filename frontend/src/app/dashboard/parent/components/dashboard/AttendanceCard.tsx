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

  const bars = breakdown.slice(-12).map(b => ({ height: b.present ? 100 : 30, present: b.present }))
  while (bars.length < 12) bars.unshift({ height: 50, present: true })
  
  const trendLabel = attendanceRate >= 90 ? '+Great' : attendanceRate >= 70 ? 'Average' : 'Low'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer relative group">
      <Link href="/dashboard/parent/attendance" className="absolute inset-0 z-10" />
      {/* Top Header Section */}
      <div className="bg-blue-500 p-4 flex items-center justify-between">
        <span className="text-white font-semibold text-[15px] tracking-wide">Attendance</span>
        <div className="bg-white/20 p-1.5 rounded-lg">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Bottom Content Section */}
      <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? <Skeleton className="h-10 w-20 mb-1" /> : (
              <span className="text-3xl font-black text-slate-800 dark:text-white leading-none block">{attendanceRate}%</span>
            )}
            <span className="text-xs text-slate-400 font-medium mt-1 block">Present</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-widest",
              attendanceRate >= 90 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : 
              attendanceRate >= 70 ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10" : 
              "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
            )}>
              {attendanceRate >= 70 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendLabel}
            </span>
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="flex items-end gap-[3px] h-12 w-full">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
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
