'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { MapPin, Hash, BookOpen } from 'lucide-react'

export default function StudentHero() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const child = data?.child
  const stats = data?.stats
  const [imgError, setImgError] = useState(false)

  if (isLoading) {
    return (
      <section className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex items-center gap-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="flex gap-4 mt-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!child) {
    return (
      <section className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center justify-center min-h-[180px]">
        <p className="text-slate-500 font-semibold">No linked children found</p>
        <p className="text-slate-400 text-sm mt-1">Link a student account to view their academic profile.</p>
      </section>
    )
  }

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
  const displayImage = (!imgError && child.profileImage && child.profileImage !== "null" && child.profileImage !== "") 
    ? child.profileImage 
    : placeholderUrl;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        
        {/* Profile Info */}
        <div className="flex items-center gap-6">
          <div className="relative size-24 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 shrink-0">
            <Image 
              src={displayImage} 
              alt={child.name} 
              fill 
              className="object-cover" 
              sizes="96px" 
              onError={() => setImgError(true)}
              unoptimized={displayImage.includes('api.dicebear.com')}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{child.name}</h2>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                Active Student
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-4">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Student ID</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Hash className="w-4 h-4 text-slate-400" />
                  {child.studentCode || 'N/A'}
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Current Class</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {child.currentClass ? `${child.currentClass.name} ${child.currentClass.section || ''}` : 'Unassigned'}
                </div>
              </div>

              {child.school && (
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">School Location</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {child.school.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <Link href={`/dashboard/parent/child-details/${child.id}`} className="px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 font-semibold text-sm rounded-xl transition-colors border border-orange-200 dark:border-orange-500/20 flex items-center gap-2">
            View Full Profile
          </Link>
        </div>

      </div>
    </section>
  )
}
