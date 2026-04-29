'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ExamToolbar } from './components/ExamToolbar'
import { ExamTable } from './components/ExamTable'
import { Exam, ExamFilter } from './components/types'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2 } from 'lucide-react'

export default function ExamsPage() {
  const params = useParams()
  const classId = params.classId as string
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ExamFilter>({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-exams', classId],
    queryFn: () => teacherService.getClassAssignments(classId), // Fetches all assessments
    enabled: !!classId,
  })

  // Map backend exam format to frontend exam format
  const exams: Exam[] = (data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    type: e.title.toLowerCase().includes('quiz') ? 'quiz' : 'exam', // Heuristic if type not explicit yet
    questions: 0,
    totalMarks: 0,
    scheduledDate: new Date(e.dueDate || e.createdAt),
    status: e.status,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
    classId: classId
  }))

  const [filteredExams, setFilteredExams] = useState<Exam[]>([])

  useEffect(() => {
    let filtered = exams

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply other filters
    if (filters.type) {
      filtered = filtered.filter(exam => exam.type === filters.type)
    }

    if (filters.status) {
      filtered = filtered.filter(exam => exam.status === filters.status)
    }

    if (filters.dateRange) {
      filtered = filtered.filter(exam =>
        exam.scheduledDate >= filters.dateRange!.start &&
        exam.scheduledDate <= filters.dateRange!.end
      )
    }

    setFilteredExams(filtered)
  }, [searchQuery, data, filters])

  const handleViewExam = (exam: Exam) => {
    console.log('View exam:', exam)
    // Navigate to exam details
  }

  const handleEditExam = (exam: Exam) => {
    console.log('Edit exam:', exam)
    // Navigate to exam editor
  }

  const handleDeleteExam = (exam: Exam) => {
    if (confirm(`Are you sure you want to delete "${exam.title}"?`)) {
      console.log('Delete exam:', exam.id)
      // TODO: Implement deletion mutation
    }
  }

  const handleDuplicateExam = (exam: Exam) => {
    console.log('Duplicate exam:', exam.id)
    // TODO: Implement duplication mutation
  }

  const handleExportExam = (exam: Exam) => {
    console.log('Export exam:', exam)
    // Implement export logic
  }

  const handleCreateExam = () => {
    console.log('Create new exam')
    // Navigate to exam creator
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
        <p className="mt-4 text-gray-500 font-medium">Loading exams...</p>
      </div>
    );
  }

  return (
    < >
      <div className="mx-auto max-w-7xl">

       

        {/* Stats Cards (Optional) */}
        {/* <ExamStats exams={exams} className="my-6" /> */}

        <ExamToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={handleFilterClick}
          filters={filters}
        />

        <ExamTable
          exams={filteredExams}
          onView={handleViewExam}
          onEdit={handleEditExam}
          onDelete={handleDeleteExam}
          onDuplicate={handleDuplicateExam}
          onExport={handleExportExam}
        />
      </div>
    </>
  )
}