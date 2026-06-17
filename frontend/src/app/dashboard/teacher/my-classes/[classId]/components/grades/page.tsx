'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GradeFilter, StudentGrade, GradeScore, GradeStatus } from './components/types'
import { GradeStatistics } from './components/GradeStatistics'
import { GradeToolbar } from './components/GradeToolbar'
import { GradeTable } from './components/GradeTable'
import { EditGradeDialog } from './components/EditGradeDialog'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2 } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { toast } from 'react-toastify'

export default function GradesPage() {
  const params = useParams()
  const classId = params.classId as string
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters] = useState<GradeFilter>({})
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['class-grades', classId],
    queryFn: () => teacherService.getClassGrades(classId),
    enabled: !!classId,
  })

  const updateGradeMutation = useMutation({
    mutationFn: (data: { studentId: string; payload: any }) => 
      teacherService.updateClassStudentGrade(classId, data.studentId, data.payload),
    onSuccess: () => {
      toast.success('Grade updated successfully')
      queryClient.invalidateQueries({ queryKey: ['class-grades', classId] })
      setIsEditDialogOpen(false)
      setEditingGrade(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update grade')
    }
  })

  const grades: StudentGrade[] = useMemo(() => (data || []).map((g: {
    id: string;
    studentId: string;
    studentName: string;
    avatar?: string;
    grades: {
      continuousAssessment: GradeScore;
      exams: GradeScore;
      total: number;
      position?: number;
    };
    status: GradeStatus;
    lastUpdated?: string | Date;
  }) => ({
    id: g.id,
    studentId: g.studentId,
    studentName: g.studentName,
    avatar: g.avatar,
    grades: g.grades,
    status: g.status,
    lastUpdated: g.lastUpdated ? new Date(g.lastUpdated) : undefined
  })), [data])

  const [filteredGrades, setFilteredGrades] = useState<StudentGrade[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    let filtered = grades

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(grade =>
        grade.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(grade => grade.status === filters.status)
    }

    // Apply score filters
    if (filters.minScore !== undefined) {
      filtered = filtered.filter(grade => 
        grade.status === 'graded' && grade.grades.total >= filters.minScore!
      )
    }

    if (filters.maxScore !== undefined) {
      filtered = filtered.filter(grade =>
        grade.status === 'graded' && grade.grades.total <= filters.maxScore!
      )
    }

    setFilteredGrades(filtered)
    setCurrentPage(1)
  }, [searchQuery, grades, filters])

  // Pagination logic
  const totalItems = filteredGrades.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedGrades = filteredGrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEditGrade = (grade: StudentGrade) => {
    setEditingGrade(grade)
    setIsEditDialogOpen(true)
  }

  const handleSaveGrade = (updatedGrade: StudentGrade) => {
    updateGradeMutation.mutate({
      studentId: updatedGrade.id,
      payload: {
        continuousScore: updatedGrade.grades.continuousAssessment.score,
        continuousTotal: updatedGrade.grades.continuousAssessment.total,
        examScore: updatedGrade.grades.exams.score,
        examTotal: updatedGrade.grades.exams.total,
        status: updatedGrade.status,
      }
    })
  }

  const handleViewDetails = (grade: StudentGrade) => {
    // console.log('View grade details:', grade)
    // Navigate to student grade details
  }

  const handleFilterClick = () => {
    // console.log('Open filter dialog')
    // Implement filter dialog
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading grades...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
      
        {/* Grade Statistics */}
        <GradeStatistics grades={grades} />

        <GradeToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={handleFilterClick}
          filters={filters}
        />

        <GradeTable
          grades={paginatedGrades}
          onEditGrade={handleEditGrade}
          onViewDetails={handleViewDetails}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Edit Grade Dialog */}
        {editingGrade && (
          <EditGradeDialog
            grade={editingGrade}
            onSave={handleSaveGrade}
            onClose={() => {
              setIsEditDialogOpen(false)
              setEditingGrade(null)
            }}
            open={isEditDialogOpen}
          />
        )}
      </div>
    </>
  )
}