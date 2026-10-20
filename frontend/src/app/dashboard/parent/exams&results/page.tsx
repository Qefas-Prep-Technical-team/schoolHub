"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import StatCards from './components/stat-cards'
import ExamList from './components/exam-list'
import SidebarRight from './components/sidebar-right'
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useParentChildren } from '@/lib/api/hooks/useParentChildren'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { ChildSummary } from '@/lib/api/services/parentService'
import { cn } from '@/lib/utils'
import { 
  Users, 
  FileText, 
  GraduationCap, 
  BarChart3, 
  Calendar, 
  ArrowRight, 
  Copy, 
  Check, 
  Award
} from 'lucide-react'
import { toast } from 'react-toastify'

// ==========================================
// Shimmering Modern Loading Skeleton
// ==========================================
function ExamsResultsPageSkeleton() {
  return (
    <div className="w-full max-w-[99%] mx-auto flex flex-col gap-3.5 sm:gap-5 pb-8 animate-in fade-in duration-300">
      {/* Child Switcher Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>
      </div>

      {/* Hero Card Skeleton */}
      <div className="rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="size-14 sm:size-18 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-7 sm:h-8 w-60 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-4 w-44 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto">
            <div className="h-9 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse w-full sm:w-28" />
            <div className="h-9 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse w-full sm:w-28" />
            <div className="h-9 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse w-full sm:w-24" />
          </div>
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 sm:h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-28 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col xl:flex-row gap-3.5 sm:gap-5 w-full">
        <div className="flex-1 space-y-4">
          <div className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="w-full xl:w-96 space-y-4 shrink-0">
          <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse" />
          <div className="h-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Empty State: No Children Linked to Parent
// ==========================================
function NoChildrenLinkedState() {
  return (
    <div className="w-full max-w-[99%] mx-auto py-4 sm:py-6 animate-in fade-in duration-300">
      <div className="rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-100 dark:border-slate-800 p-5 sm:p-9 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 size-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-5 sm:space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Award size={14} />
            Parent Portal • Academic Evaluations
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              No Children Linked to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              To track continuous assessment grades, view scheduled examination papers, and review official terminal report cards, connect your child using their unique school-issued Student Access Code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
              <span className="text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 1</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                Obtain your child&apos;s unique Student Access Code (e.g. STU-2024-001) from their school administrator.
              </p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
              <span className="text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 2</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                Go to Linked Students and submit a connection authorization request.
              </p>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
              <span className="text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 3</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                Once verified, all test scores, homework marks, and termly transcripts will update here automatically.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/dashboard/parent/my-children">
              <button className="h-10 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-[0.99]">
                <span>Go to Linked Students</span>
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExamsResultsPage() {
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied] = useState(false)

  const { selectedChildId, setSelectedChildId } = useParentStore()
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren()

  // Validate that selectedChildId belongs to the current logged-in parent
  useEffect(() => {
    if (children.length > 0) {
      const isValidChild = children.some((c) => c.id === selectedChildId)
      if (!selectedChildId || !isValidChild) {
        setSelectedChildId(children[0].id)
      }
    }
  }, [children, selectedChildId, setSelectedChildId])

  const activeChildId = selectedChildId || (children.length > 0 ? children[0]?.id : undefined)
  const activeChild = children.find((c) => c.id === activeChildId)
  const { data: dashboardData } = useParentDashboard(activeChildId)

  if (isChildrenLoading) {
    return <ExamsResultsPageSkeleton />
  }

  if (!isChildrenLoading && children.length === 0) {
    return <NoChildrenLinkedState />
  }

  const studentName = activeChild?.name || dashboardData?.child?.name || 'Student'
  const studentCode = activeChild?.studentCode || 'N/A'
  const className = activeChild?.currentClass?.name || dashboardData?.child?.currentClass?.name || 'Classroom Cohort'
  const section = activeChild?.currentClass?.section || dashboardData?.child?.currentClass?.section
  const schoolName = activeChild?.school?.name || (activeChild as unknown as { schoolName?: string })?.schoolName

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`
  const studentImage = activeChild?.profileImage
  const displayImage = (!imgError && studentImage && studentImage !== "null" && studentImage !== "")
    ? studentImage
    : fallbackAvatar

  const handleCopyCode = () => {
    if (!studentCode || studentCode === 'N/A') return
    navigator.clipboard.writeText(studentCode)
    setCopied(true)
    toast.success("Student Access Code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-[99%] mx-auto flex flex-col gap-3.5 sm:gap-5 pb-8 animate-in fade-in duration-200">
      
      {/* Clean Unified Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Student Avatar */}
          <div className="relative size-12 sm:size-14 shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-orange-100 dark:bg-orange-950/40">
            <Image
              src={displayImage}
              alt={studentName}
              fill
              unoptimized
              onError={() => setImgError(true)}
              className="object-cover"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {studentName}&apos;s Exams &amp; Results
              </h1>
              <HeaderTooltip
                content={`Continuous assessment and examination portal for ${studentName}. Track marks across Homework, Quizzes, Continuous Assessments (CA), and official term exams mapped to WAEC standards.`}
                size={16}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              {children.length > 1 && (
                <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <Users size={12} className="text-orange-500" />
                  <select
                    value={activeChildId}
                    onChange={(e) => {
                      setSelectedChildId(e.target.value)
                      setImgError(false)
                    }}
                    className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer pr-4"
                  >
                    {children.map((child: ChildSummary) => (
                      <option key={child.id} value={child.id} className="dark:bg-slate-900">
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {studentCode !== 'N/A' && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Click to copy Student Access Code"
                >
                  <span>Code: {studentCode}</span>
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} className="text-slate-400" />}
                </button>
              )}

              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {className} {section ? `(${section})` : ''}
              </span>

              {schoolName && (
                <span className="hidden sm:inline-block text-slate-400">
                  • {schoolName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end flex-wrap sm:flex-nowrap">
          <Link href="/dashboard/parent/exams&results/analytics" className="flex-1 sm:flex-none">
            <button className="w-full h-9 sm:h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-1.5 shadow-xs">
              <BarChart3 size={14} />
              <span>Analytics</span>
            </button>
          </Link>
          <Link href="/dashboard/parent/exams&results/report-card" className="flex-1 sm:flex-none">
            <button className="w-full h-9 sm:h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-1.5 shadow-xs">
              <GraduationCap size={15} />
              <span>Dashboard Report</span>
            </button>
          </Link>
          <Link href="/dashboard/parent/exams&results/calender" className="flex-1 sm:flex-none">
            <button className="w-full h-9 sm:h-10 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs shadow-orange-600/20">
              <Calendar size={14} />
              <span>Timetable</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <StatCards />

      {/* Main Content Area: Exams & Continuous Assessment */}
      <div className="flex flex-col xl:flex-row gap-3.5 sm:gap-5 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex-1 min-w-0">
          <ExamList />
        </div>
        <div className="w-full xl:w-96 shrink-0">
          <SidebarRight />
        </div>
      </div>
    </div>
  )
}
