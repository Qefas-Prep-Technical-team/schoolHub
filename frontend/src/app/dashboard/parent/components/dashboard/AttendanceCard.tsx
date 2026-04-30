import { cn } from '@/lib/utils'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'

export default function AttendanceCard() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const attendanceRate = data?.stats?.attendanceRate ?? 0
  const breakdown = data?.stats?.attendanceBreakdown ?? []

  // Build bar heights (normalize so max = 100%)
  // We show up to 12 bars (last 12 records), each is present=100 or absent=30
  const bars = breakdown.slice(-12).map(b => ({ height: b.present ? 100 : 30, present: b.present }))
  // Pad to 12 if fewer records
  while (bars.length < 12) bars.unshift({ height: 50, present: true })

  const trend = attendanceRate >= 90 ? '+high' : attendanceRate >= 70 ? 'avg' : 'low'
  const trendLabel = attendanceRate >= 90 ? '+Great' : attendanceRate >= 70 ? 'Average' : 'Low'

  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-2xl ring-1 ring-orange-500/20 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Attendance</h3>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Monitoring</span>
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-widest border",
          attendanceRate >= 90
            ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
            : attendanceRate >= 70
            ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
            : "text-rose-600 bg-rose-500/10 border-rose-500/20"
        )}>
          <span className="material-symbols-outlined text-[12px]">{attendanceRate >= 70 ? 'trending_up' : 'trending_down'}</span>
          {trendLabel}
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-10 w-24 rounded-xl mb-4" />
      ) : (
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">Present</span>
        </div>
      )}

      {/* Bar chart from attendance breakdown */}
      <div className="flex items-end gap-1.5 h-16 w-full mt-auto">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full rounded-lg bg-slate-100 dark:bg-slate-800" style={{ height: '60%' }} />
            ))
          : bars.map((bar, index) => (
              <div
                key={index}
                className={cn(
                  "w-full rounded-lg transition-all duration-500 group-hover:scale-y-110",
                  !bar.present ? "bg-rose-500/40" : "bg-orange-600"
                )}
                style={{ height: `${bar.height}%` }}
                title={bar.present ? 'Present' : 'Absent'}
              />
            ))}
      </div>

      <button className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-600/5 hover:bg-orange-600 hover:text-white border border-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        View Full History <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  )
}
