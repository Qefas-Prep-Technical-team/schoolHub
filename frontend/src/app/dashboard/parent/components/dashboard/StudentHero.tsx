'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useParentStore } from '@/lib/api/hooks/useParentStore'

export default function StudentHero() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading } = useParentDashboard(selectedChildId)
  const child = data?.child
  const stats = data?.stats
  const [imgError, setImgError] = useState(false)


  const gradeLabel = (avg: number) => {
    if (avg >= 90) return 'A+'
    if (avg >= 80) return 'A'
    if (avg >= 70) return 'B'
    if (avg >= 60) return 'C'
    if (avg >= 50) return 'D'
    return 'F'
  }

  const standing = (avg: number) => {
    if (avg >= 80) return 'Excellent Standing'
    if (avg >= 60) return 'Good Standing'
    return 'Needs Improvement'
  }

  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between">
          <div className="flex items-center gap-8">
            <Skeleton className="size-32 rounded-[1.8rem]" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-60 rounded-xl" />
              <Skeleton className="h-4 w-40 rounded-lg" />
              <div className="flex gap-3">
                <Skeleton className="h-8 w-28 rounded-xl" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-28 rounded-3xl" />
            <Skeleton className="h-24 w-28 rounded-3xl" />
            <Skeleton className="h-24 w-28 rounded-3xl" />
          </div>
        </div>
      </section>
    )
  }

  if (!child) {
    return (
      <section className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 p-8 lg:p-10 flex items-center justify-center min-h-[180px]">
        <div className="text-center">
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">No linked children found</p>
          <p className="text-slate-400 text-xs mt-2">Link a student account to view their academic profile.</p>
        </div>
      </section>
    )
  }

  const avg = stats?.averageGrade ?? 0
  const attendanceRate = stats?.attendanceRate ?? 0
  
  const todayAttendance = stats?.todayAttendance?.toLowerCase() || 'none'
  const isPresent = todayAttendance === 'present'
  const isLate = todayAttendance === 'late'
  const isAbsent = todayAttendance === 'absent'
  const isNone = todayAttendance === 'none'

  const quickStats = [
    { value: `${attendanceRate}%`, label: 'Attendance' },
    { value: gradeLabel(avg), label: 'Avg Grade', color: 'text-primary' },
    { value: child.currentClass?.name ?? '—', label: 'Class' },
  ]

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
  const displayImage = (!imgError && child.profileImage && child.profileImage !== "null" && child.profileImage !== "") 
    ? child.profileImage 
    : placeholderUrl;

  return (
    <section className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 p-8 lg:p-10">
      <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-orange-500/10 via-orange-500/[0.02] to-transparent pointer-events-none transition-opacity duration-1000 group-hover:opacity-60" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between relative z-10">
        {/* Left: Profile Info */}
        <div className="flex items-center gap-8">
          <div className="relative group/avatar">
            <div className="absolute -inset-2 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-[2rem] blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity duration-500" />
            <div className="relative size-32 rounded-[1.8rem] overflow-hidden shadow-2xl ring-4 ring-white dark:ring-slate-800">
              <Image 
                src={displayImage} 
                alt={child.name} 
                fill 
                className="object-cover" 
                sizes="128px" 
                onError={() => setImgError(true)}
                unoptimized={displayImage.includes('api.dicebear.com')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{child.name}</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="px-4 py-1.5 bg-orange-600/10 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse" />
                  {standing(avg)}
                </div>
                
                <div className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-2",
                  isPresent ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                  isAbsent ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400" :
                  isLate ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" :
                  "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400"
                )}>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isPresent ? "bg-emerald-500" :
                    isAbsent ? "bg-red-500" :
                    isLate ? "bg-amber-500" :
                    "bg-slate-500"
                  )} />
                  {isNone ? 'Today: Unmarked' : `Today: ${todayAttendance}`}
                </div>
              </div>
            </div>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              {child.currentClass ? `${child.currentClass.name}${child.currentClass.section ? ` • Section ${child.currentClass.section}` : ''}` : 'No Class'} • ID: <span className="text-orange-600">#{child.studentCode}</span>
            </p>

            {child.school && (
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
                  <span className="material-symbols-outlined text-orange-600 text-[18px]">location_on</span>
                  <span className="uppercase tracking-widest">{child.school.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Quick Stats */}
        <div className="flex flex-1 items-center justify-center lg:justify-start gap-3 sm:gap-6 flex-wrap pb-4 lg:pb-0 px-2">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="group/stat flex flex-col items-center p-3 flex-1 min-w-[110px] max-w-[180px] rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 hover:border-orange-500/30"
            >
              <span className={`text-xl font-black tracking-tighter truncate w-full text-center ${stat.color ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`} title={stat.value}>
                {stat.value}
              </span>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 group-hover/stat:text-orange-500 transition-colors text-center w-full">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col gap-4 shrink-0">
          <Link href="/dashboard/parent/support" className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-2xl shadow-orange-600/30 active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">mail</span>
            <span>Contact Support</span>
          </Link>
          <Link href={`/dashboard/parent/child-details/${child.id}`} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-500 group/btn active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px] text-orange-600 group-hover/btn:text-white">person</span>
            <span>View Child</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
