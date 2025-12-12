import React from 'react'

export default function PerformanceCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
            <span className="material-symbols-outlined">school</span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Performance</h3>
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
              strokeWidth="3"
            />
            <path
              className="text-purple-600"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="88, 100"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white">88%</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <p className="text-sm text-slate-500 dark:text-slate-400">Class Avg</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">82%</p>
          <p className="text-xs text-green-600 font-medium">Above Average</p>
        </div>
      </div>
      
      <button className="mt-4 text-purple-600 text-sm font-semibold hover:underline flex items-center gap-1">
        View Results <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  )
}