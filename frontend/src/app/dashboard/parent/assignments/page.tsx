'use client'

import { useState } from 'react'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '@/lib/api/services/studentService'
import OverviewWidgets from './components/OverviewWidgets'
import FilterToolbar from './components/FilterToolbar'
import AssignmentCard from './components/AssignmentCard'
import Pagination from './components/Pagination'
import DownloadReportButton from './components/DownloadReportButton'
import { LayoutGrid, List } from 'lucide-react'

export default function ParentAssignmentsPage() {
  const { selectedChildId } = useParentStore()
  const { data, isLoading: isDashboardLoading } = useParentDashboard(selectedChildId)

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useQuery({
      queryKey: ['student-assignments', selectedChildId, currentPage, itemsPerPage],
      queryFn: () => studentService.getStudentAssignments(selectedChildId!, currentPage, itemsPerPage),
      enabled: !!selectedChildId,
      staleTime: 1000 * 60 * 2, // 2 mins
  })

  const assignments = assignmentsData?.assignments || []
  const isLoading = isDashboardLoading || isAssignmentsLoading
  
  const totalPages = assignmentsData?.pages || 1
  const currentAssignments = assignments

  return (
      <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            {/* Page Heading & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Assignments Overview
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage and track academic progress
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* View Toggle */}
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                    aria-label="List view"
                  >
                    <List className="size-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="size-5" />
                  </button>
                </div>

                {/* Action Button */}
                <DownloadReportButton student={data?.child} stats={data?.stats} />
              </div>
            </div>

            {/* Dynamic Widgets */}
            <OverviewWidgets 
              totalAssessments={assignmentsData?.total || 0}
              averageScore={data?.stats?.averageGrade ?? 0}
              highestScore={
                assignments.length > 0
                  ? Math.round(Math.max(0, ...assignments.map((a: any) => {
                      if (!a.grade) return 0;
                      const parts = a.grade.split('/');
                      const score = parseFloat(parts[0]);
                      const max = parts.length > 1 ? parseFloat(parts[1]) : 100;
                      if (isNaN(score) || isNaN(max) || max === 0) return 0;
                      return (score / max) * 100;
                    })))
                  : 0
              }
            />
            
            {/* Assignments List */}
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {isLoading ? (
                <>
                  {[...Array(itemsPerPage)].map((_, i) => (
                    <div key={i} className={`animate-pulse bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex ${viewMode === 'grid' ? 'flex-col gap-4' : 'flex-col md:flex-row gap-6 items-start md:items-center'}`}>
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-xl size-14 shrink-0"></div>
                      <div className="flex-1 w-full space-y-3">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-2"></div>
                      </div>
                      <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'w-full justify-between' : 'w-full md:w-auto justify-end'}`}>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-28"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : assignments.length === 0 ? (
                <div className="p-10 text-center text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 col-span-full">
                  No assignments found for this child yet.
                </div>
              ) : (
                currentAssignments.map((assignmentObj: any, i: number) => {
                  const rawStatus = (assignmentObj.status || 'PENDING').toLowerCase();
                  
                  let cardStatus = rawStatus;
                  if (cardStatus === "overdue") cardStatus = "late";
                  if (cardStatus === "submitted") cardStatus = "urgent";
                  if (cardStatus === "scored") cardStatus = "graded";
                  if (!['late', 'urgent', 'pending', 'graded'].includes(cardStatus)) {
                    cardStatus = "pending";
                  }

                  const globalIndex = (currentPage - 1) * itemsPerPage + i + 1;
                  const scoreStr = (cardStatus === "graded" && assignmentObj.grade) ? assignmentObj.grade : undefined;

                  return (
                    <AssignmentCard
                      key={assignmentObj.id}
                      id={assignmentObj.id}
                      subject={assignmentObj.subject || 'Unknown Subject'}
                      teacher="Course Instructor"
                      title={assignmentObj.title}
                      status={cardStatus as any}
                      dueDate={assignmentObj.dueDate ? `Due ${new Date(assignmentObj.dueDate).toLocaleDateString()}` : "No due date"}
                      score={scoreStr}
                      icon={i % 2 === 0 ? "book_2" : "science"}
                      index={globalIndex}
                      viewMode={viewMode}
                    />
                  )
                })
              )}
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            )}
          </div>
        </div>
      </main>
  )
}
