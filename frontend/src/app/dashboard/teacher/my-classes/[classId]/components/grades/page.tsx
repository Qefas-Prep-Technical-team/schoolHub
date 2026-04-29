'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { GradeFilter, StudentGrade } from './components/types'
import { GradeStatistics } from './components/GradeStatistics'
import { GradeToolbar } from './components/GradeToolbar'
import { GradeTable } from './components/GradeTable'
import { EditGradeDialog } from './components/EditGradeDialog'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2 } from 'lucide-react'

export default function GradesPage() {
  const params = useParams()
  const classId = params.classId as string
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<GradeFilter>({})
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-grades', classId],
    queryFn: () => teacherService.getClassGrades(classId),
    enabled: !!classId,
  })

  const grades: StudentGrade[] = (data || []).map((g: any) => ({
    id: g.id,
    studentId: g.studentId,
    studentName: g.studentName,
    avatar: g.avatar,
    grades: g.grades,
    status: g.status,
    lastUpdated: g.lastUpdated ? new Date(g.lastUpdated) : undefined
  }))

  const [filteredGrades, setFilteredGrades] = useState<StudentGrade[]>([])

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
  }, [searchQuery, data, filters])

  const handleEditGrade = (grade: StudentGrade) => {
    setEditingGrade(grade)
    setIsEditDialogOpen(true)
  }

  const handleSaveGrade = (updatedGrade: StudentGrade) => {
    console.log('Save grade:', updatedGrade)
    // TODO: Implement update mutation
    setIsEditDialogOpen(false)
    setEditingGrade(null)
  }

  const handleViewDetails = (grade: StudentGrade) => {
    console.log('View grade details:', grade)
    // Navigate to student grade details
  }

  const handleImportGrades = () => {
    console.log('Import grades')
    // Implement import logic
  }

  const handleExportGrades = () => {
    console.log('Export grades')
    // Implement export logic
  }

  const handleFilterClick = () => {
    console.log('Open filter dialog')
    // Implement filter dialog
  }

  const handleLogout = () => {
    console.log('Logout')
    // Implement logout logic
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
          grades={filteredGrades}
          onEditGrade={handleEditGrade}
          onViewDetails={handleViewDetails}
        />

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