import React from 'react'
import { cn } from '@/lib/utils'

interface Assignment {
  title: string
  due: string
  status: 'urgent' | 'upcoming'
}

const assignments: Assignment[] = [
  { title: 'History Essay', due: 'Due Tomorrow', status: 'urgent' },
  { title: 'Physics Lab Report', due: 'Due Oct 28', status: 'upcoming' },
]

export default function AssignmentsCard() {
  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-2xl ring-1 ring-orange-500/20 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Assignments</h3>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Pending Tasks</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 flex-1">
        {assignments.map((assignment, index) => (
          <div 
            key={index}
            className={cn(
              "group/item relative pl-4 border-l-2 transition-all duration-300",
              assignment.status === 'urgent' 
                ? "border-rose-500 bg-rose-500/5" 
                : "border-slate-200 dark:border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5"
            )}
          >
            <div className="p-2">
              <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{assignment.title}</p>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest mt-1",
                assignment.status === 'urgent' ? "text-rose-500" : "text-slate-400 group-hover/item:text-orange-500"
              )}>
                {assignment.due}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-600/5 hover:bg-orange-600 hover:text-white border border-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        All Assignments <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  )
}
