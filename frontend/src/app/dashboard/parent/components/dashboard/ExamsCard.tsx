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
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-2xl ring-1 ring-orange-500/20 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-[20px]">assignment_late</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Upcoming Exams</h3>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Academic Evaluation</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 flex-1">
        {exams.map((exam, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-orange-500/5 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-orange-500/10 group/item">
            <div className="flex flex-col items-center justify-center rounded-xl px-2 py-2 min-w-[3.5rem] bg-orange-600/10 text-orange-600 border border-orange-500/20 group-hover/item:bg-orange-600 group-hover/item:text-white transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{exam.month}</span>
              <span className="text-xl font-black leading-none mt-0.5">{exam.day}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{exam.subject}</span>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">{exam.time} • {exam.type}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-600/5 hover:bg-orange-600 hover:text-white border border-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        Exam Schedule <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  )
}
