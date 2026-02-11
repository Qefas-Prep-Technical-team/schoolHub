import React from 'react'

export default function AttendanceCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg">
            <span className="material-symbols-outlined">calendar_today</span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Attendance</h3>
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">trending_up</span> +2%
        </span>
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">98%</span>
        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">Present</span>
      </div>
      
      {/* Mini Chart Simulation */}
      <div className="flex items-end gap-1 h-12 w-full mt-auto">
        {[60, 80, 100, 40, 90, 95].map((height, index) => (
          <div
            key={index}
            className={`w-full rounded-t-sm h-[${height}%] ${index === 3 ? 'bg-red-400/50' : index >= 4 ? 'bg-primary' : 'bg-primary/20'}`}
            title={index === 3 ? 'Absent' : 'Present'}
          />
        ))}
      </div>
      
      <button className="mt-4 text-primary text-sm font-semibold hover:underline flex items-center gap-1">
        View Full History <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  )
}