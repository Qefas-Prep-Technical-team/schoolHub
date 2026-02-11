import React from 'react'

interface Exam {
  month: string
  day: string
  subject: string
  time: string
  type: string
  color: string
}

const exams: Exam[] = [
  { month: 'Oct', day: '24', subject: 'Mathematics', time: '09:00 AM', type: 'Mid-Term', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  { month: 'Oct', day: '26', subject: 'Science', time: '11:00 AM', type: 'Mid-Term', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
]

export default function ExamsCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
            <span className="material-symbols-outlined">assignment_late</span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Exams</h3>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        {exams.map((exam, index) => (
          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className={`flex flex-col items-center rounded px-2 py-1 min-w-[3rem] ${exam.color}`}>
              <span className="text-xs font-bold uppercase">{exam.month}</span>
              <span className="text-lg font-bold leading-none">{exam.day}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{exam.subject}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{exam.time} • {exam.type}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-2 text-orange-600 text-sm font-semibold hover:underline flex items-center gap-1">
        Exam Schedule <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </div>
  )
}