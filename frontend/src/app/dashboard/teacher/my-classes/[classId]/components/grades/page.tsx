'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GradeFilter, StudentGrade, GradeScore, GradeStatus, IndividualGrade } from './components/types'
import { GradeStatistics } from './components/GradeStatistics'
import { GradeToolbar } from './components/GradeToolbar'
import { GradeTable } from './components/GradeTable'
import { EditGradeDialog } from './components/EditGradeDialog'
import { ViewGradeDetailsDialog } from './components/ViewGradeDetailsDialog'
import { GradeFilterDialog } from './components/GradeFilterDialog'
import { teacherService } from '@/lib/api/services/teacherService'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore'
import { Loader2 } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { toast } from 'react-toastify'
import { TabSkeleton } from '../TabSkeleton'

export default function GradesPage() {
  const params = useParams()
  const classId = params.classId as string
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { selectedSchoolId } = useDashboardStore()
  const currentTeacherId = (user as any)?.id as string | undefined
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<GradeFilter>({})
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null)
  const [editingItem, setEditingItem] = useState<IndividualGrade | undefined>(undefined)
  const [newTitle, setNewTitle] = useState<string | undefined>(undefined)
  const [newCategory, setNewCategory] = useState<string | undefined>(undefined)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewingGrade, setViewingGrade] = useState<StudentGrade | null>(null)
  const [viewingItem, setViewingItem] = useState<IndividualGrade | undefined>(undefined)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

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
      setEditingItem(undefined)
      setNewTitle(undefined)
      setNewCategory(undefined)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update grade')
    }
  })

  const deleteGradeMutation = useMutation({
    mutationFn: (gradeId: string) => teacherService.deleteClassGrade(classId, gradeId),
    onSuccess: () => {
      toast.success('Grade deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['class-grades', classId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete grade')
    }
  })

  // Fetch teacher's assigned subjects to determine edit/delete authorization (requires schoolId)
  const isPersonal = selectedSchoolId === currentTeacherId;
  const filterId = isPersonal ? undefined : selectedSchoolId;
  const { data: subjectsData } = useQuery({
    queryKey: ['teacher-subjects', filterId],
    queryFn: () => teacherService.getSubjects(filterId ? { schoolId: filterId } : {}),
    staleTime: 1000 * 60 * 5,
  })

  // Set of subject names this teacher is authorized to manage
  const authorizedSubjects = useMemo(() => {
    if (!subjectsData) return new Set<string>()
    return new Set<string>((subjectsData as any[]).map((s: any) => (s.subject?.name || s.name || '').toLowerCase()))
  }, [subjectsData])

  const grades: StudentGrade[] = useMemo(() => (data || []).map((g: any) => {
    let normalizedTotal = g.grades.total || 0;
    
    if (g.status === 'graded') {
      const caScore = g.grades.continuousAssessment?.score || 0;
      const caTotal = g.grades.continuousAssessment?.total || 0;
      const examScore = g.grades.exams?.score || 0;
      const examTotal = g.grades.exams?.total || 0;
      
      const earnedScore = caScore + examScore;
      const maxPossibleScore = caTotal + examTotal;
      
      if (maxPossibleScore > 0) {
        normalizedTotal = Math.round((earnedScore / maxPossibleScore) * 100);
      } else if (g.grades.total > 100) {
        normalizedTotal = g.grades.total;
      }
    }

    return {
      id: g.id,
      studentId: g.studentId,
      studentName: g.studentName,
      avatar: g.avatar,
      individualGrades: g.individualGrades,
      grades: {
        ...g.grades,
        total: normalizedTotal,
      },
      status: g.status,
      lastUpdated: g.lastUpdated ? new Date(g.lastUpdated) : undefined
    };
  }), [data])

  const [filteredGrades, setFilteredGrades] = useState<StudentGrade[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    let filtered = grades

    if (searchQuery.trim()) {
      filtered = filtered.filter((grade: StudentGrade) =>
        grade.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filters.status) {
      filtered = filtered.filter((grade: StudentGrade) => grade.status.toLowerCase() === filters.status?.toLowerCase())
    }

    const isGradedStatus = (status: string) => ['graded', 'published', 'scored'].includes(status.toLowerCase())

    if (filters.minScore !== undefined) {
      filtered = filtered.filter((grade: StudentGrade) => 
        isGradedStatus(grade.status) && grade.grades.total >= filters.minScore!
      )
    }

    if (filters.maxScore !== undefined) {
      filtered = filtered.filter((grade: StudentGrade) =>
        isGradedStatus(grade.status) && grade.grades.total <= filters.maxScore!
      )
    }

    if (filters.type || filters.subject) {
      filtered = filtered.map(grade => {
        if (!grade.individualGrades) return grade;
        
        const filteredItems = grade.individualGrades.filter(ig => {
          let match = true;
          
          if (filters.type) {
            const searchType = filters.type.toLowerCase();
            const igType = (ig.type || ig.category || '').toLowerCase();
            if (!igType.includes(searchType)) match = false;
          }
          
          if (filters.subject) {
            const searchSubject = filters.subject.toLowerCase();
            const igSubject = (ig.subject || '').toLowerCase();
            if (!igSubject.includes(searchSubject)) match = false;
          }
          
          return match;
        });
        
        return { ...grade, individualGrades: filteredItems };
      }).filter(grade => grade.individualGrades && grade.individualGrades.length > 0);
    }

    setFilteredGrades(filtered)
    setCurrentPage(1)
  }, [searchQuery, grades, filters])

  const listRows = useMemo(() => {
    const rows = filteredGrades.flatMap(grade => {
      const items = grade.individualGrades || [];
      return items.map(item => ({ grade, item }));
    });

    // Sort: teacher's own grades or authorized subjects first (editable), then the rest — each group sorted by date desc
    rows.sort((a, b) => {
      const aIsEditable = (a.item.teacherId === currentTeacherId) || (a.item.subject && authorizedSubjects.has(a.item.subject.toLowerCase())) ? 0 : 1
      const bIsEditable = (b.item.teacherId === currentTeacherId) || (b.item.subject && authorizedSubjects.has(b.item.subject.toLowerCase())) ? 0 : 1
      if (aIsEditable !== bIsEditable) return aIsEditable - bIsEditable
      const dateA = new Date(a.item.updatedAt || a.item.createdAt || 0).getTime()
      const dateB = new Date(b.item.updatedAt || b.item.createdAt || 0).getTime()
      return dateB - dateA
    });

    return rows;
  }, [filteredGrades, currentTeacherId, authorizedSubjects]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    grades.forEach(grade => {
      grade.individualGrades?.forEach(ig => {
        if (ig.subject) subjects.add(ig.subject);
      });
    });
    return Array.from(subjects).sort();
  }, [grades]);

  const totalItems = viewMode === 'list' ? listRows.length : filteredGrades.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const paginatedGrades = viewMode === 'grid' 
    ? filteredGrades.slice(startIndex, startIndex + itemsPerPage)
    : []

  const paginatedListRows = viewMode === 'list'
    ? listRows.slice(startIndex, startIndex + itemsPerPage)
    : []

  const handleEditGrade = (grade: StudentGrade, item?: IndividualGrade, newTitle?: string, newCategory?: string) => {
    setEditingGrade(grade)
    setEditingItem(item)
    setNewTitle(newTitle)
    setNewCategory(newCategory)
    setIsEditDialogOpen(true)
  }

  const handleSaveGrade = (payload: any) => {
    updateGradeMutation.mutate({
      studentId: payload.studentId,
      payload
    })
  }

  const handleViewDetails = (grade: StudentGrade, item?: IndividualGrade) => {
    setViewingGrade(grade)
    setViewingItem(item)
    setIsViewDialogOpen(true)
  }

  const handleFilterClick = () => {
    setIsFilterDialogOpen(true)
  }

  if (isLoading) {
    return <TabSkeleton tabId="grades" />;
  }


  return (
    <>
      <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
        <GradeStatistics grades={grades} />

        <GradeToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={handleFilterClick}
          filters={filters}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode)
            setSelectedStudentId(null)
          }}
        />

        <GradeTable
          grades={paginatedGrades}
          listRows={paginatedListRows}
          viewMode={viewMode}
          onEditGrade={handleEditGrade}
          onViewDetails={handleViewDetails}
          onDeleteGrade={(item) => deleteGradeMutation.mutate(item.id)}
          currentTeacherId={currentTeacherId}
          authorizedSubjects={authorizedSubjects}
          startIndex={startIndex}
          selectedStudentId={selectedStudentId}
          onStudentSelect={setSelectedStudentId}
        />

        {totalPages > 1 && !selectedStudentId && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {editingGrade && (
          <EditGradeDialog
            grade={editingGrade}
            item={editingItem}
            newTitle={newTitle}
            newCategory={newCategory}
            onSave={handleSaveGrade}
            onClose={() => {
              setIsEditDialogOpen(false)
              setEditingGrade(null)
              setEditingItem(undefined)
              setNewTitle(undefined)
              setNewCategory(undefined)
            }}
            open={isEditDialogOpen}
            isSaving={updateGradeMutation.isPending}
          />
        )}

        {viewingGrade && (
          <ViewGradeDetailsDialog
            grade={viewingGrade}
            item={viewingItem}
            open={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setViewingGrade(null)
              setViewingItem(undefined)
            }}
          />
        )}
        {isFilterDialogOpen && (
          <GradeFilterDialog
            open={isFilterDialogOpen}
            onClose={() => setIsFilterDialogOpen(false)}
            currentFilters={filters}
            onApply={(newFilters: GradeFilter) => setFilters(newFilters)}
            availableSubjects={availableSubjects}
          />
        )}
      </div>
    </>
  )
}