import React from 'react'
import { cn } from '@/lib/utils'

export default function AttendanceCard() {
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
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-widest border border-emerald-500/20">
          <span className="material-symbols-outlined text-[12px]">trending_up</span> +2%
        </span>
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">98%</span>
        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">Present</span>
      </div>
      
      {/* Mini Chart Simulation */}
      <div className="flex items-end gap-1.5 h-16 w-full mt-auto">
        {[60, 80, 100, 40, 90, 95].map((height, index) => (
          <div
            key={index}
            className={cn(
              "w-full rounded-lg transition-all duration-500 group-hover:scale-y-110",
              index === 3 ? "bg-rose-500/40" : index >= 4 ? "bg-orange-600" : "bg-orange-600/20"
            )}
            style={{ height: `${height}%` }}
            title={index === 3 ? 'Absent' : 'Present'}
          />
        ))}
      </div>
      
      <button className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-600/5 hover:bg-orange-600 hover:text-white border border-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        View Full History <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  )
}
