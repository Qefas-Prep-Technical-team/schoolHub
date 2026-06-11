'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ExamToolbar } from './components/ExamToolbar'
import { ExamTable } from './components/ExamTable'
import { Exam, ExamFilter, ExamStatus } from './components/types'
import { teacherService } from '@/lib/api/services/teacherService'
import { Loader2 } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'

export default function ExamsPage() {
  const params = useParams()
  const classId = params.classId as string
  const [searchQuery, setSearchQuery] = useState('')
  const [filters] = useState<ExamFilter>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, isLoading } = useQuery({
    queryKey: ['class-exams-and-papers', classId],
    queryFn: async () => {
      let examsRes = [];
      let papersRes = [];
      try {
        examsRes = await teacherService.getExams({ classId });
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      }
      try {
        papersRes = await teacherService.getSubjectPapers({ classId });
      } catch (error) {
        console.error("Failed to fetch subject papers:", error);
      }
      return { exams: examsRes || [], papers: papersRes || [] };
    },
    enabled: !!classId,
  })

  // Map backend exam format to frontend exam format
  const exams: Exam[] = useMemo(() => [
    ...(data?.exams || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      type: (e.title || '').toLowerCase().includes('quiz') ? 'quiz' : 'exam',
      questions: e.totalQuestions || 0,
      totalMarks: e.totalMarks || 0,
      scheduledDate: new Date(e.startDate || e.createdAt),
      status: e.status?.toLowerCase() || 'draft',
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
      classId: classId
    })),
    ...(data?.papers || []).map((p: any) => ({
      id: p.id,
      title: p.title || 'Untitled Subject Paper',
      type: 'subject_paper',
      questions: p.questions?.length || 0,
      totalMarks: p.totalMarks || 0,
      scheduledDate: new Date(p.createdAt), // Papers don't have scheduled dates usually
      status: p.status === 'APPROVED' ? 'published' : 'draft',
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      classId: classId
    }))
  ], [data, classId]);

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
    setCurrentPage(1)
  }, [searchQuery, exams, filters])

  const handleViewExam = (exam: Exam) => {
    // console.log('View exam:', exam)
    // Navigate to exam details
  }

  const handleEditExam = (exam: Exam) => {
    // console.log('Edit exam:', exam)
    // Navigate to exam editor
  }

  const handleDeleteExam = (exam: Exam) => {
    if (confirm(`Are you sure you want to delete "${exam.title}"?`)) {
      // console.log('Delete exam:', exam.id)
      // TODO: Implement deletion mutation
    }
  }

  const handleDuplicateExam = (exam: Exam) => {
    // console.log('Duplicate exam:', exam.id)
    // TODO: Implement duplication mutation
  }

  const handleExportExam = (exam: Exam) => {
    // console.log('Export exam:', exam)
    // Implement export logic
  }

  const handleFilterClick = () => {
    // console.log('Open filter dialog')
    // Implement filter dialog
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
          exams={filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
          onView={handleViewExam}
          onEdit={handleEditExam}
          onDelete={handleDeleteExam}
          onDuplicate={handleDuplicateExam}
          onExport={handleExportExam}
        />
        
        {filteredExams.length > 0 && (
            <div className="mt-8 flex justify-center pb-8">
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredExams.length / itemsPerPage)}
                    totalItems={filteredExams.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        )}
      </div>
    </>
  )
}