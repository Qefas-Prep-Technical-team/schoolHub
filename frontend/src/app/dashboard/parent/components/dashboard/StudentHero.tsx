'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useParentChildren } from '@/lib/api/hooks/useParentChildren'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { MapPin, Hash, BookOpen, ChevronRight, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StudentHero() {
  const { selectedChildId, setSelectedChildId } = useParentStore()
  const { data: children = [] } = useParentChildren()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const child = data?.child
  const [imgError, setImgError] = useState(false)

  if (isLoading) {
    return (
      <section className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
          <Skeleton className="size-16 sm:size-20 md:size-24 rounded-2xl sm:rounded-3xl shrink-0" />
          <div className="flex flex-col gap-2.5 w-full">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="flex flex-wrap gap-2 mt-2">
              <Skeleton className="h-7 w-28 rounded-xl" />
              <Skeleton className="h-7 w-28 rounded-xl" />
              <Skeleton className="h-7 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!child) {
    return (
      <section className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
          <UserCheck size={24} />
        </div>
        <p className="text-slate-800 dark:text-white font-bold text-base sm:text-lg">No linked children found</p>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm">
          Link a student account in Linking Center to view their real-time academic profile and performance.
        </p>
        <Link 
          href="/dashboard/parent/linking" 
          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          Go to Linking Center
        </Link>
      </section>
    )
  }

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`
  const displayImage = (!imgError && child.profileImage && child.profileImage !== "null" && child.profileImage !== "") 
    ? child.profileImage 
    : placeholderUrl

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 md:p-8 transition-all">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-orange-500/[0.08] via-amber-500/[0.03] to-transparent pointer-events-none" />

      {/* Multi-child switcher pills if parent has more than 1 linked child */}
      {children.length > 1 && (
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 scrollbar-hide">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            Selected Child:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {children.map((c) => {
              const isSelected = selectedChildId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChildId(c.id)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95",
                    isSelected
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20 ring-2 ring-orange-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#fff' : '#ea580c' }} />
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row gap-5 sm:gap-6 md:gap-8 items-start md:items-center justify-between">
        
        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto min-w-0">
          <div className="relative size-16 sm:size-20 md:size-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm ring-4 ring-orange-500/10">
            <Image 
              src={displayImage} 
              alt={child.name} 
              fill 
              className="object-cover" 
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px" 
              onError={() => setImgError(true)}
              unoptimized={displayImage.includes('api.dicebear.com')}
            />
            <div className="absolute bottom-1 right-1 size-3 sm:size-3.5 bg-emerald-500 ring-2 ring-white dark:ring-slate-900 rounded-full" title="Active" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-full">
                {child.name}
              </h2>
              <span className="px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                Active Student
              </span>
            </div>
            
            {/* Quick Stat Chips */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Hash className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">ID:</span>
                <span className="tracking-tight">{child.studentCode || 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Class:</span>
                <span className="tracking-tight">
                  {child.currentClass ? `${child.currentClass.name} ${child.currentClass.section || ''}` : 'Unassigned'}
                </span>
              </div>

              {child.school && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{child.school.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto shrink-0 pt-2 sm:pt-0">
          <Link 
            href={`/dashboard/parent/child-details/${child.id}`} 
            className="w-full md:w-auto px-5 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 group"
          >
            <span>View Full Profile</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  )
}
