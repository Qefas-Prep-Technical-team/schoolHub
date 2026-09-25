'use client'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function PerformanceCard() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const avg = data?.stats?.averageGrade ?? 0
  const dash = `${avg}, 100`

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer relative group">
      <Link href="/dashboard/parent/performance" className="absolute inset-0 z-10" />
      {/* Top Header Section */}
      <div className="bg-indigo-500 p-4 flex items-center justify-between">
        <span className="text-white font-semibold text-[15px] tracking-wide">Performance</span>
        <div className="bg-white/20 p-1.5 rounded-lg">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Bottom Content Section */}
      <div className="p-5 flex items-center justify-between flex-1">
        <div>
          {isLoading ? <Skeleton className="h-10 w-20 mb-1" /> : (
            <span className="text-3xl font-black text-slate-800 dark:text-white leading-none block">{avg}%</span>
          )}
          <span className="text-xs text-slate-400 font-medium mt-1 block">Average</span>
        </div>

        {/* Radial Progress */}
        <div className="relative size-16">
          {isLoading ? (
            <Skeleton className="size-16 rounded-full" />
          ) : (
            <>
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={dash}
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{avg}%</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
