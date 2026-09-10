'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ExamToolbar } from './components/ExamToolbar'
import { ExamTable } from './components/ExamTable'
import { Exam, ExamFilter, ExamStatus } from './components/types'
import { teacherService } from '@/lib/api/services/teacherService'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore'
import { Loader2 } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { TabSkeleton } from '../TabSkeleton'

export default function ExamsPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string
  const { user } = useAuthStore()
  const { selectedSchoolId } = useDashboardStore()
  const currentTeacherId = (user as any)?.id as string | undefined
  const [searchQuery, setSearchQuery] = useState('')
  const [filters] = useState<ExamFilter>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, isLoading } = useQuery({
    queryKey: ['class-exams-and-papers', classId],
    queryFn: async () => {
      let examsRes = [];
      let papersRes = [];
      let assignmentsRes = [];
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
      try {
        assignmentsRes = await teacherService.getAssignments({ classId });
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      }
      return { exams: examsRes || [], papers: papersRes || [], assignments: assignmentsRes || [] };
    },
    enabled: !!classId,
  })

  const isPersonal = selectedSchoolId === currentTeacherId;
  const filterId = isPersonal ? undefined : selectedSchoolId;
  const { data: subjectsData } = useQuery({
    queryKey: ['teacher-subjects', filterId],
    queryFn: () => teacherService.getSubjects(filterId ? { schoolId: filterId } : {}),
    staleTime: 1000 * 60 * 5,
  })

  const authorizedSubjects = useMemo(() => {
    if (!subjectsData) return new Set<string>()
    return new Set<string>((subjectsData as any[]).map((s: any) => (s.subject?.name || s.name || '').toLowerCase()))
  }, [subjectsData])

  // Map backend exam format to frontend exam format
  const exams: Exam[] = useMemo(() => [
    ...(data?.exams || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      type: e.category?.toLowerCase() || 
            ((e.title || '').toLowerCase().includes('ca ') || (e.title || '').toLowerCase().includes(' ca') || (e.title || '').toLowerCase() === 'ca' ? 'ca' : 
            (e.title || '').toLowerCase().includes('quiz') ? 'quiz' : 'exam'),
      subjects: [
        ...(e.subjectExamPapers?.map((sep: any) => sep.subjectPaper?.subject?.name || sep.subject?.name) || []),
        e.subject?.name || e.subject
      ].filter(Boolean),
      teacherId: e.teacherId,
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
      type: p.category?.toLowerCase() || 
            ((p.title || '').toLowerCase().includes('ca ') || (p.title || '').toLowerCase().includes(' ca') || (p.title || '').toLowerCase() === 'ca' ? 'ca' : 
            (p.title || '').toLowerCase().includes('quiz') ? 'quiz' : 'subject_paper'),
      subjects: [p.subject?.name || p.subject].filter(Boolean),
      teacherId: p.teacherId,
      questions: p.questions?.length || 0,
      totalMarks: p.totalMarks || 0,
      scheduledDate: new Date(p.createdAt), // Papers don't have scheduled dates usually
      status: p.status === 'APPROVED' ? 'published' : 'draft',
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      classId: classId
    })),
    ...(data?.assignments || []).map((a: any) => ({
      id: a.id,
      title: a.title || 'Untitled Assignment',
      type: 'assignment',
      subjects: [a.subject?.name || a.subject].filter(Boolean),
      teacherId: a.teacherId,
      questions: a.totalQuestions || a.questions?.length || 0,
      totalMarks: a.totalMarks || a.maxScore || 100,
      scheduledDate: new Date(a.dueDate || a.createdAt),
      status: a.status?.toLowerCase() || 'published',
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
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
    const params: Record<string, string> = {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      questions: exam.questions.toString(),
      marks: exam.totalMarks.toString(),
      subject: (exam.subjects && exam.subjects.length > 0) ? exam.subjects[0] : 'General'
    };
    if (classId) {
      params.fromClass = classId;
    }
    const searchParams = new URLSearchParams(params);
    router.push(`/dashboard/teacher/exams&quizzes/preview?${searchParams.toString()}`)
  }

  const handleEditExam = (exam: Exam) => {
    router.push(`/dashboard/teacher/exams&quizzes/${exam.id}/papers`)
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
    return <TabSkeleton tabId="exams&quizzes" />;
  }
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  return (
    < >
      <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

       

        {/* Stats Cards (Optional) */}
        {/* <ExamStats exams={exams} className="my-6" /> */}

        <ExamToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={handleFilterClick}
          filters={filters}
        />

        <ExamTable
          exams={paginatedExams}
          onView={handleViewExam}
          onEdit={handleEditExam}
          onDelete={(exam) => console.log('Delete', exam)}
          onDuplicate={(exam) => console.log('Duplicate', exam)}
          onExport={(exam) => console.log('Export', exam)}
          startIndex={startIndex}
          currentTeacherId={currentTeacherId}
          authorizedSubjects={authorizedSubjects}
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