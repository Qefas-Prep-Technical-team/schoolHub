'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useParentChildren } from '@/lib/api/hooks/useParentChildren'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '@/lib/api/services/studentService'
import OverviewWidgets from './components/OverviewWidgets'
import FilterToolbar from './components/FilterToolbar'
import AssignmentCard from './components/AssignmentCard'
import Pagination from './components/Pagination'
import DownloadReportButton from './components/DownloadReportButton'
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  LayoutGrid, 
  List, 
  Users, 
  BookOpen, 
  ArrowRight, 
  RotateCw, 
  SearchX, 
  CheckCircle2, 
  GraduationCap 
} from 'lucide-react'

interface RawAssignmentItem {
  id: string;
  title: string;
  subject?: string;
  department?: string;
  instructorId?: string;
  dueDate?: string;
  status?: string;
  progress?: number;
  grade?: string | null;
  feedback?: string | null;
  submissionDate?: string;
  totalMarks?: number;
  questionCount?: number;
  createdAt?: string;
}

// ==========================================
// Full Shimmering Modern Loading Skeleton
// ==========================================
function AssignmentsPageSkeleton({ viewMode }: { viewMode: 'list' | 'grid' }) {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      {/* Child Switcher Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>
      </div>

      {/* Hero Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 sm:h-10 w-64 max-w-sm bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-4 w-72 max-w-md bg-slate-100 dark:bg-slate-800/70 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="size-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="h-20 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse" />

      {/* Cards Skeleton */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className={`bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/80 dark:border-slate-800 p-6 flex ${
              viewMode === 'grid' ? 'flex-col gap-4' : 'flex-col md:flex-row gap-6 items-start md:items-center'
            } animate-pulse`}
          >
            <div className="size-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 w-full space-y-2">
              <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded mt-1" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Empty State: No Children Linked
// ==========================================
function NoChildrenLinkedState() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      <div className="rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-100 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 size-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Users size={14} />
            Parent Portal • Assignments Intelligence
          </div>

          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              No Children Linked to Your Account
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              To track continuous assessment deliverables, monitor homework submissions, and view teacher feedback for your children, connect your student using their school-issued Student Access Code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 1</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Obtain your child&apos;s unique Student Access Code (e.g. STU-2024-001) from their school.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 2</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Go to Linked Students and enter the access code to send an authorization request.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 3</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Once verified, all upcoming homework tasks, deadlines, and teacher rubrics will sync here.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/dashboard/parent/my-children">
              <Button className="h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <span>Go to Linked Students</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Empty State: No Assignments for Student
// ==========================================
interface NoAssignmentsStateProps {
  childName: string;
  onRefresh: () => void;
}

function NoAssignmentsState({ childName, onRefresh }: NoAssignmentsStateProps) {
  return (
    <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
      <div className="size-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 size={32} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          All Coursework is Up to Date!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Course instructors have not published any pending assignments or continuous assessment tasks for <span className="font-semibold text-slate-700 dark:text-slate-300">{childName}</span> at this time.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <Button
          type="button"
          onClick={onRefresh}
          variant="outline"
          className="h-10 px-5 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-colors shadow-xs"
        >
          <RotateCw size={14} />
          <span>Check Again</span>
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// Main Parent Assignments Page
// ==========================================
export default function ParentAssignmentsPage() {
  const { selectedChildId, setSelectedChildId } = useParentStore()
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren()

  // Auto-select first child if none is currently selected in store
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id)
    }
  }, [children, selectedChildId, setSelectedChildId])

  const { data: dashboardData, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId)

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('due_asc')

  const { 
    data: assignmentsData, 
    isLoading: isAssignmentsLoading,
    refetch: refetchAssignments 
  } = useQuery({
    queryKey: ['student-assignments', selectedChildId, currentPage, itemsPerPage],
    queryFn: () => studentService.getStudentAssignments(selectedChildId!, currentPage, itemsPerPage),
    enabled: !!selectedChildId,
    staleTime: 1000 * 60 * 2, // 2 mins
  })

  const rawAssignments: RawAssignmentItem[] = (assignmentsData?.assignments || []) as RawAssignmentItem[]
  const totalPages = assignmentsData?.pages || 1

  const selectedChild = children.find((c) => c.id === selectedChildId) || dashboardData?.child
  const childName = selectedChild?.name || dashboardData?.child?.name || "Student"
  const studentCode = selectedChild?.studentCode || dashboardData?.child?.studentCode || ""

  // Extract unique subjects for filter tabs
  const availableSubjects = useMemo(() => {
    const set = new Set<string>()
    rawAssignments.forEach((a) => {
      if (a.subject && a.subject.trim()) {
        set.add(a.subject.trim())
      }
    })
    return ['All', ...Array.from(set)]
  }, [rawAssignments])

  // Client-side filtering & sorting for instant search
  const filteredAssignments = useMemo(() => {
    let result = [...rawAssignments]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((a) => 
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.subject && a.subject.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q))
      )
    }

    // 2. Subject Filter
    if (selectedSubject !== 'All') {
      result = result.filter((a) => a.subject === selectedSubject)
    }

    // 3. Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter((a) => {
        const s = (a.status || 'pending').toLowerCase()
        if (selectedStatus === 'late') return s === 'overdue' || s === 'late'
        if (selectedStatus === 'submitted') return s === 'submitted' || s === 'urgent'
        if (selectedStatus === 'graded') return s === 'graded' || s === 'scored'
        if (selectedStatus === 'pending') return s === 'pending'
        return s === selectedStatus
      })
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'due_asc') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (sortBy === 'due_desc') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      }
      if (sortBy === 'newest') {
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'highest_score') {
        const parseScore = (grade?: string | null) => {
          if (!grade) return 0
          const parts = grade.split('/')
          const score = parseFloat(parts[0])
          const max = parts.length > 1 ? parseFloat(parts[1]) : 100
          if (isNaN(score) || isNaN(max) || max === 0) return 0
          return (score / max) * 100
        }
        return parseScore(b.grade) - parseScore(a.grade)
      }
      return 0
    })

    return result
  }, [rawAssignments, searchQuery, selectedSubject, selectedStatus, sortBy])

  // Statistics calculation for KPI widgets
  const stats = useMemo(() => {
    const totalCount = assignmentsData?.total ?? rawAssignments.length
    const graded = rawAssignments.filter((a) => (a.status || '').toLowerCase() === 'graded' || (a.status || '').toLowerCase() === 'scored')
    const gradedCount = graded.length
    const pendingCount = rawAssignments.filter((a) => {
      const s = (a.status || '').toLowerCase()
      return s === 'pending' || s === 'submitted' || s === 'overdue' || s === 'late'
    }).length

    let avg = dashboardData?.stats?.averageGrade ?? 0
    if (graded.length > 0 && !dashboardData?.stats?.averageGrade) {
      const sum = graded.reduce((acc, a) => {
        if (!a.grade) return acc
        const parts = a.grade.split('/')
        const score = parseFloat(parts[0])
        const max = parts.length > 1 ? parseFloat(parts[1]) : 100
        return isNaN(score) ? acc : acc + ((score / (max || 100)) * 100)
      }, 0)
      avg = Math.round(sum / graded.length)
    }

    return {
      totalCount,
      gradedCount,
      averageScore: avg,
      pendingCount,
    }
  }, [assignmentsData, rawAssignments, dashboardData])

  const isLoadingOverall = isChildrenLoading || isDashboardLoading || isAssignmentsLoading

  // 1. Loading State
  if (isLoadingOverall) {
    return <AssignmentsPageSkeleton viewMode={viewMode} />
  }

  // 2. Empty State: No Children Linked
  if (!isChildrenLoading && children.length === 0) {
    return <NoChildrenLinkedState />
  }

  // 3. Main Loaded State
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      
      {/* Multi-Child Switcher if parent has more than 1 child */}
      {children.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            Student:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {children.map((child) => {
              const isSelected = selectedChildId === child.id
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildId(child.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 active:scale-95",
                    isSelected
                      ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-500/20"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500/40"
                  )}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#fff' : '#ea580c' }} />
                  <span>{child.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-72 rounded-full bg-gradient-to-bl from-orange-400/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen size={13} />
                Coursework Hub
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Student: <span className="font-bold text-slate-900 dark:text-white">{childName}</span>
                {studentCode && <span className="font-mono text-orange-600 text-[10px] ml-1">({studentCode})</span>}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Assignments & Homework
              </h1>
              <HeaderTooltip
                content="Detailed log of all homework, continuous assessment deliverables, and project submissions assigned to your child across their curriculum. Track upcoming due dates, monitor completion progress, review teacher grading rubrics, and download official terminal assessment dossiers."
                size={18}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Track active assignments, submission deadlines, scored rubrics, and teacher feedback for {childName}.
            </p>
          </div>

          {/* Controls: View Mode & Download Button */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list'
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
                aria-label="List view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'grid'
                    ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Terminal Report Export */}
            <DownloadReportButton student={dashboardData?.child} stats={dashboardData?.stats} />
          </div>
        </div>
      </div>

      {/* 4 KPI Overview Widgets */}
      <OverviewWidgets 
        totalAssessments={stats.totalCount}
        gradedCount={stats.gradedCount}
        averageScore={stats.averageScore}
        pendingCount={stats.pendingCount}
      />

      {/* Search & Filter Toolbar */}
      {rawAssignments.length > 0 && (
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          availableSubjects={availableSubjects}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}

      {/* Assignments Grid / List Content */}
      <div className="space-y-4">
        {rawAssignments.length === 0 ? (
          <NoAssignmentsState 
            childName={childName}
            onRefresh={() => refetchAssignments()}
          />
        ) : filteredAssignments.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
              <SearchX size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No matching assignments found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No assignments matched your search or status filters. Try clearing your filters to view all coursework.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedSubject('All')
                setSelectedStatus('all')
              }}
              className="mt-2 h-9 px-4 rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredAssignments.map((assignmentObj, i) => {
              const rawStatus = (assignmentObj.status || 'PENDING').toLowerCase()
              
              let cardStatus: 'late' | 'urgent' | 'pending' | 'graded' = 'pending'
              if (rawStatus === 'overdue' || rawStatus === 'late') cardStatus = 'late'
              else if (rawStatus === 'submitted') cardStatus = 'urgent'
              else if (rawStatus === 'graded' || rawStatus === 'scored') cardStatus = 'graded'

              const globalIndex = (currentPage - 1) * itemsPerPage + i + 1
              const scoreStr = (cardStatus === 'graded' && assignmentObj.grade) ? assignmentObj.grade : undefined

              return (
                <AssignmentCard
                  key={assignmentObj.id}
                  id={assignmentObj.id}
                  subject={assignmentObj.subject || 'Core Subject'}
                  teacher={assignmentObj.department || "Course Instructor"}
                  title={assignmentObj.title}
                  status={cardStatus}
                  dueDate={assignmentObj.dueDate ? `Due ${new Date(assignmentObj.dueDate).toLocaleDateString()}` : "No deadline"}
                  score={scoreStr}
                  icon={i % 2 === 0 ? "book_2" : "science"}
                  index={globalIndex}
                  viewMode={viewMode}
                />
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-4 flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
