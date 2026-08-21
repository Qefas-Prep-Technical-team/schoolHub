import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import Link from 'next/link'

export default function AssignmentsCard() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const grades = data?.child?.recentGrades ?? []

  const getStatus = (score: number, maxMarks: number) => {
    const pct = maxMarks > 0 ? (score / maxMarks) * 100 : 0
    return pct < 50 ? 'urgent' : 'upcoming'
  }

  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-2xl ring-1 ring-orange-500/20 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Recent Grades</h3>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Latest Results</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="pl-4 border-l-2 border-slate-200 dark:border-white/10 p-2">
              <Skeleton className="h-4 w-32 rounded-lg mb-2" />
              <Skeleton className="h-3 w-20 rounded-lg" />
            </div>
          ))
        ) : grades.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">No grades published yet</p>
          </div>
        ) : (
          grades.map((g) => {
            const status = getStatus(g.score, g.maxMarks)
            const pct = g.maxMarks > 0 ? Math.round((g.score / g.maxMarks) * 100) : 0
            return (
              <div
                key={g.id}
                className={cn(
                  "group/item relative pl-4 border-l-2 transition-all duration-300",
                  status === 'urgent'
                    ? "border-rose-500 bg-rose-500/5"
                    : "border-slate-200 dark:border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5"
                )}
              >
                <div className="p-2">
                  <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{g.subject}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mt-1",
                    status === 'urgent' ? "text-rose-500" : "text-slate-400 group-hover/item:text-orange-500"
                  )}>
                    {g.score}/{g.maxMarks} ({pct}%) • {g.assessmentType ?? 'Exam'} • {format(parseISO(g.createdAt), 'MMM d')}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Link href="/dashboard/parent/assignments" className="mt-5 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-orange-600 bg-orange-600/5 hover:bg-orange-600 hover:text-white border border-orange-500/20 transition-all duration-300 flex items-center justify-center gap-2">
        All Grades <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </Link>
    </div>
  )
}
