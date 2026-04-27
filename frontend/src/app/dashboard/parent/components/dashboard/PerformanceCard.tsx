import React from 'react'
import { cn } from '@/lib/utils'

export default function PerformanceCard() {
  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600/10 text-amber-600 rounded-2xl ring-1 ring-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Performance</h3>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Academic Progress</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Radial Progress Simulation */}
        <div className="relative size-20">
          <svg className="size-full" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-amber-500 transition-all duration-1000 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="88, 100"
              strokeWidth="3.5"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">88%</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Class Avg</p>
          <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">82%</p>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.1em] mt-1.5">Above Average</p>
        </div>
      </div>
      
      <button className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-amber-600 bg-amber-600/5 hover:bg-amber-600 hover:text-white border border-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        View Results <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  )
}
