'use client'

import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function AssignmentsCard() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const grades = data?.child?.recentGrades ?? []

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer relative group">
      <Link href="/dashboard/parent/assignments" className="absolute inset-0 z-10" />
      {/* Top Header Section */}
      <div className="bg-emerald-500 p-3 sm:p-4 flex items-center justify-between">
        <span className="text-white font-bold text-xs sm:text-[15px] tracking-wide truncate">Recent Grades</span>
        <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg shrink-0">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
      </div>
      
      {/* Bottom Content Section */}
      <div className="p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-4 flex-1 justify-between">
        <div>
          {isLoading ? <Skeleton className="h-7 sm:h-9 w-12 mb-1" /> : (
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-none block">{grades.length}</span>
          )}
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 block">Recent</span>
        </div>

        <div className="flex-1 overflow-hidden mt-auto pt-1">
          {isLoading ? (
             <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
             </div>
          ) : grades.length === 0 ? (
             <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">No grades published</p>
          ) : (
             <div className="flex flex-col gap-1.5">
               {grades.slice(0, 2).map((g) => {
                 const pct = g.maxMarks > 0 ? Math.round((g.score / g.maxMarks) * 100) : 0;
                 const isUrgent = pct < 50;
                 return (
                   <div key={g.id} className="flex items-center gap-1.5 min-w-0">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isUrgent ? "bg-rose-500" : "bg-emerald-400")} />
                      <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 truncate flex-1 font-medium">
                        {g.subject}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0 font-bold">
                        {pct}%
                      </span>
                   </div>
                 )
               })}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
