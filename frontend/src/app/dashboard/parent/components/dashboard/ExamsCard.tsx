'use client'
import { format, parseISO } from 'date-fns'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExamsCard() {
  const { data, isLoading } = useParentDashboard()
  const exams = data?.upcomingExams ?? []

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
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-lg" />
              </div>
            </div>
          ))
        ) : exams.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">No upcoming exams</p>
          </div>
        ) : (
          exams.map((exam) => {
            const date = exam.startDate ? parseISO(exam.startDate) : null
            return (
              <div key={exam.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-orange-500/5 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-orange-500/10 group/item">
                <div className="flex flex-col items-center justify-center rounded-xl px-2 py-2 min-w-[3.5rem] bg-orange-600/10 text-orange-600 border border-orange-500/20 group-hover/item:bg-orange-600 group-hover/item:text-white transition-all duration-500">
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{date ? format(date, 'MMM') : '—'}</span>
                  <span className="text-xl font-black leading-none mt-0.5">{date ? format(date, 'd') : '—'}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                    {exam.subject?.name ?? exam.title}
                  </span>
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">
                    {date ? format(date, 'h:mm a') : 'TBA'} • {exam.category}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <button className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-600/5 hover:bg-orange-600 hover:text-white border border-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        Exam Schedule <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </button>
    </div>
  )
}
