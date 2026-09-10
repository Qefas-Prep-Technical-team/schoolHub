'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { AssignmentTable } from './components/AssignmentTable'
import { SearchBar } from './components/SearchBar'
import { Pagination } from '../student/components/Pagination'
import { Assignment } from './components/types'
import { GradeModal } from './components/GradeModal'
import { useMemo } from 'react'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { TabSkeleton } from '../TabSkeleton'

// ... mockUser, mockNavItems etc (keeping them for now if used elsewhere, but data should be dynamic)

export default function AssignmentsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const effectiveSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [assignmentToGrade, setAssignmentToGrade] = useState<Assignment | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['class-assignments', classId],
    queryFn: () => teacherService.getClassAssignments(classId),
    enabled: !!classId,
  })

  const assignments: Assignment[] = useMemo(() => {
    return (data || []).map((a: {
      id: string;
      title: string;
      dueDate: string | Date;
      status: string;
      submissions: { submitted: number; total: number };
      createdAt: string | Date;
      updatedAt: string | Date;
    }) => ({
      id: a.id,
      title: a.title,
      dueDate: new Date(a.dueDate),
      status: a.status as 'published' | 'draft' | 'closed',
      submissions: a.submissions,
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
    }))
  }, [data])

  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssignments(assignments)
    } else {
      const filtered = assignments.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAssignments(filtered)
    }
    setCurrentPage(1) // Reset to first page on search
  }, [searchQuery, assignments])

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage)
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleViewAssignment = (assignment: Assignment) => {
    router.push(`/dashboard/teacher/assignments/${assignment.id}`)
  }

  const handleEditAssignment = (assignment: Assignment) => {
    router.push(`/dashboard/teacher/assignments/${assignment.id}?edit=true`)
  }

  const handleGradeAssignment = (assignment: Assignment) => {
    setAssignmentToGrade(assignment)
    setGradeModalOpen(true)
  }

  const handleDeleteClick = (assignment: Assignment) => {
    setAssignmentToDelete(assignment)
    setDeleteModalOpen(true)
  }

  const handleUnpublish = async (assignment: Assignment) => {
    try {
      await teacherService.updateAssignmentStatus(assignment.id, 'DRAFT', effectiveSchoolId as string)
      queryClient.invalidateQueries({ queryKey: ['class-assignments', classId] })
      toast.success('Assignment unpublished successfully')
    } catch (error) {
      toast.error('Failed to unpublish assignment')
    }
  }

  const confirmDelete = async () => {
    if (!assignmentToDelete) return
    setIsDeleting(true)
    try {
      await teacherService.deleteAssignment(assignmentToDelete.id, effectiveSchoolId as string)
      queryClient.invalidateQueries({ queryKey: ['class-assignments', classId] })
      toast.success('Assignment deleted successfully')
      setDeleteModalOpen(false)
    } catch (error) {
      toast.error('Failed to delete assignment')
    } finally {
      setIsDeleting(false)
      setAssignmentToDelete(null)
    }
  }

  if (isLoading) {
    return <TabSkeleton tabId="assignments" />;
  }

  return (
   
      <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
       
   

       

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search assignments..."
        />

        <AssignmentTable
          assignments={paginatedAssignments}
          onView={handleViewAssignment}
          onEdit={handleEditAssignment}
          onGrade={handleGradeAssignment}
          onDelete={handleDeleteClick}
          onUnpublish={handleUnpublish}
          currentUserId={user?.id}
          startIndex={(currentPage - 1) * itemsPerPage}
        />

        {filteredAssignments.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAssignments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Assignment</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{assignmentToDelete?.title}"</span>? This action cannot be undone and will remove all associated submissions.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setAssignmentToDelete(null)
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <GradeModal
          assignmentId={assignmentToGrade?.id || null}
          schoolId={effectiveSchoolId as string}
          isOpen={gradeModalOpen}
          onClose={() => setGradeModalOpen(false)}
        />
      </div>
   
  )
}