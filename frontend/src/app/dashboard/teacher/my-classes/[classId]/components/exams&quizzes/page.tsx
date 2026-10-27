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
import { TeacherPagination as Pagination } from '@/app/dashboard/teacher/components/TeacherPagination'
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
    queryKey: ['class-exams-and-papers', classId, selectedSchoolId],
    queryFn: async () => {
      let examsRes = [];
      let papersRes = [];
      const schoolId = selectedSchoolId || undefined;
      try {
        examsRes = await teacherService.getExams({ classId, schoolId });
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      }
      try {
        papersRes = await teacherService.getSubjectPapers({ classId, schoolId });
      } catch (error) {
        console.error("Failed to fetch subject papers:", error);
      }
      return { exams: examsRes || [], papers: papersRes || [] };
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 2,
  })

  // Fetch class detail to reliably get schoolId (cached by other tabs, so usually free)
  const { data: classDetailData } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => teacherService.getClassDetail(classId),
    staleTime: 1000 * 60 * 10,
    enabled: !!classId,
  });
  // classInfo.teacherSubjectIds = subject IDs this teacher teaches in this class
  // Memoize to keep a stable reference (prevents infinite re-render loop)
  const classSchoolId = useMemo(
    () => (classDetailData as any)?.classInfo?.schoolId || (classDetailData as any)?.schoolId,
    [classDetailData]
  );
  const teacherSubjectIdsFromClass = useMemo<string[]>(
    () => (classDetailData as any)?.classInfo?.teacherSubjectIds || [],
    [classDetailData]
  );

  // Also fetch subjects for name-based matching
  const schoolIdForSubjects = classSchoolId || (selectedSchoolId !== currentTeacherId ? selectedSchoolId : null);
  const { data: subjectsData } = useQuery({
    queryKey: ['teacher-subjects', schoolIdForSubjects],
    queryFn: () => teacherService.getSubjects(schoolIdForSubjects ? { schoolId: schoolIdForSubjects } : {}),
    staleTime: 1000 * 60 * 5,
    enabled: !!schoolIdForSubjects,
  })

  const authorizedSubjects = useMemo(() => {
    if (!subjectsData) return new Set<string>()
    const names = (subjectsData as any[]).map((s: any) => (s.subject?.name || s.name || '').toLowerCase()).filter(Boolean)
    return new Set<string>(names)
  }, [subjectsData])

  // Only use IDs from class detail to strictly highlight subjects they teach in THIS class
  const authorizedSubjectIds = useMemo(() => {
    return new Set<string>(teacherSubjectIdsFromClass);
  }, [teacherSubjectIdsFromClass])

  // Map backend exam format to frontend exam format
  const exams: Exam[] = useMemo(() => {
    console.log("LOG: Recomputing exams", { 
      examsCount: data?.exams?.length,
      authorizedSubjectIds: Array.from(authorizedSubjectIds),
      authorizedSubjects: Array.from(authorizedSubjects)
    });
    
    const hasAuthorizedFilter = authorizedSubjectIds.size > 0 || authorizedSubjects.size > 0;

    const filteredRawExams = (data?.exams || []).filter((e: any) => {
      if (!hasAuthorizedFilter) return true;
      if (e.teacherId && currentTeacherId && e.teacherId === currentTeacherId) return true;
      if (e.subjectId && authorizedSubjectIds.has(e.subjectId)) return true;
      if (e.subject?.id && authorizedSubjectIds.has(e.subject.id)) return true;
      const examSubName = (e.subject?.name || e.subject || '').toLowerCase();
      if (examSubName && authorizedSubjects.has(examSubName)) return true;
      if (Array.isArray(e.subjectExamPapers)) {
        return e.subjectExamPapers.some((sep: any) => {
          const subId = sep.subjectPaper?.subject?.id || sep.subjectPaper?.subjectId || sep.subjectId || sep.subject?.id;
          const subName = (sep.subjectPaper?.subject?.name || sep.subject?.name || '').toLowerCase();
          const isMyPaper = (sep.teacherId && currentTeacherId && sep.teacherId === currentTeacherId) || (sep.subjectPaper?.teacherId && currentTeacherId && sep.subjectPaper?.teacherId === currentTeacherId);
          return (subId && authorizedSubjectIds.has(subId)) || (subName && authorizedSubjects.has(subName)) || isMyPaper;
        });
      }
      return false;
    });

    const filteredRawPapers = (data?.papers || []).filter((p: any) => {
      if (!hasAuthorizedFilter) return true;
      if (p.teacherId && currentTeacherId && p.teacherId === currentTeacherId) return true;
      const subId = p.subject?.id || p.subjectId;
      if (subId && authorizedSubjectIds.has(subId)) return true;
      const subName = (p.subject?.name || p.subject || '').toLowerCase();
      if (subName && authorizedSubjects.has(subName)) return true;
      return false;
    });

    return [
    ...filteredRawExams.map((e: any) => {
      const myPaper = e.subjectExamPapers?.find((sep: any) => {
        const subId = sep.subjectPaper?.subject?.id || sep.subjectPaper?.subjectId || sep.subjectId || sep.subject?.id;
        const subName = (sep.subjectPaper?.subject?.name || sep.subject?.name || '').toLowerCase();
        const hasId = authorizedSubjectIds.has(subId);
        const hasName = authorizedSubjects.has(subName);
        const isMyPaper = (sep.teacherId && currentTeacherId && sep.teacherId === currentTeacherId) || (sep.subjectPaper?.teacherId && currentTeacherId && sep.subjectPaper?.teacherId === currentTeacherId);
        return hasId || hasName || isMyPaper;
      });

      const relevantSubjectPapers = (e.subjectExamPapers || []).filter((sep: any) => {
        if (!hasAuthorizedFilter) return true;
        const subId = sep.subjectPaper?.subject?.id || sep.subjectPaper?.subjectId || sep.subjectId || sep.subject?.id;
        const subName = (sep.subjectPaper?.subject?.name || sep.subject?.name || '').toLowerCase();
        const isMyPaper = (sep.teacherId && currentTeacherId && sep.teacherId === currentTeacherId) || (sep.subjectPaper?.teacherId && currentTeacherId && sep.subjectPaper?.teacherId === currentTeacherId);
        return (subId && authorizedSubjectIds.has(subId)) || (subName && authorizedSubjects.has(subName)) || isMyPaper;
      });

      return {
      id: e.id,
      title: e.title,
      type: e.category?.toLowerCase() || 
            ((e.title || '').toLowerCase().includes('ca ') || (e.title || '').toLowerCase().includes(' ca') || (e.title || '').toLowerCase() === 'ca' ? 'ca' : 
            (e.title || '').toLowerCase().includes('quiz') ? 'quiz' : 'exam'),
      subjects: [
        ...(relevantSubjectPapers.map((sep: any) => sep.subjectPaper?.subject?.name || sep.subject?.name) || []),
        e.subject?.name || e.subject
      ].filter(Boolean),
      subjectIds: [
        ...(relevantSubjectPapers.map((sep: any) => sep.subjectPaper?.subject?.id || sep.subjectPaper?.subjectId || sep.subjectId || sep.subject?.id) || []),
        e.subject?.id || e.subjectId
      ].filter(Boolean),
      teacherId: e.teacherId,
      questions: e.totalQuestions || 0,
      totalMarks: e.totalMarks || 0,
      scheduledDate: new Date(e.startDate || e.createdAt),
      status: e.status?.toLowerCase() || 'draft',
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
      classId: classId,
      subjectPaperIds: relevantSubjectPapers.map((sep: any) => sep.subjectPaperId).filter(Boolean),
      mySubjectPaperId: myPaper?.subjectPaperId || undefined,
      subjectPapers: relevantSubjectPapers.map((sep: any) => {
        const title = sep.title || sep.subjectPaper?.title || sep.paper?.title || sep.subjectPaper?.subject?.name || sep.subject?.name || 'Untitled Subject Paper';
        const subjectId = sep.subject?.id || sep.subjectId || sep.subjectPaper?.subject?.id || sep.subjectPaper?.subjectId;
        const subjectName = sep.subject?.name || sep.subjectPaper?.subject?.name;
        
        return {
          id: sep.id || sep.subjectPaperId || sep.subjectPaper?.id,
          title: title,
          subjectId: subjectId,
          subjectName: subjectName !== title ? subjectName : undefined,
          questionsCount: sep.questions?.length || sep.totalQuestions || sep._count?.questions || sep.subjectPaper?.questions?.length || sep.paper?.questions?.length || 0,
          totalMarks: sep.totalMarks || sep.subjectPaper?.totalMarks || sep.paper?.totalMarks || 0
        };
      })
    };
    }),
    ...filteredRawPapers.map((p: any) => ({
      id: p.id,
      title: p.title || 'Untitled Subject Paper',
      type: p.category?.toLowerCase() || 
            ((p.title || '').toLowerCase().includes('ca ') || (p.title || '').toLowerCase().includes(' ca') || (p.title || '').toLowerCase() === 'ca' ? 'ca' : 
            (p.title || '').toLowerCase().includes('quiz') ? 'quiz' : 'subject_paper'),
      subjects: [p.subject?.name || p.subject].filter(Boolean),
      subjectIds: [p.subject?.id || p.subjectId].filter(Boolean),
      teacherId: p.teacherId,
      questions: p.totalQuestions || p.questions?.length || p._count?.questions || 0,
      totalMarks: p.totalMarks || 0,
      scheduledDate: new Date(p.createdAt),
      status: p.status === 'APPROVED' ? 'published' : 'draft',
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      classId: classId,
      subjectPaperIds: [p.id], // paper itself IS the subject paper
      mySubjectPaperId: p.id
    }))
  ];
  }, [data, classId, authorizedSubjects, authorizedSubjectIds, currentTeacherId]);

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
    if (exam.type === 'assignment') {
      // Navigate to assignment edit page
      router.push(`/dashboard/teacher/assignments/${exam.id}?edit=true`)
    } else if (exam.type === 'subject_paper') {
      // A standalone subject paper — open the question editor directly
      router.push(`/dashboard/teacher/exams&quizzes/papers/${exam.id}`)
    } else {
      // Exam, quiz, CA — navigate to the attached subject paper's editor if one exists
      if (exam.mySubjectPaperId) {
        // Teacher's specific subject paper
        router.push(`/dashboard/teacher/exams&quizzes/papers/${exam.mySubjectPaperId}`)
      } else if (exam.subjectPaperIds && exam.subjectPaperIds.length > 0) {
        // Fallback to the first paper if mySubjectPaperId isn't found
        router.push(`/dashboard/teacher/exams&quizzes/papers/${exam.subjectPaperIds[0]}`)
      } else {
        // No subject paper attached yet — go to the exam's papers page to attach one
        router.push(`/dashboard/teacher/exams&quizzes/${exam.id}/papers`)
      }
    }
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
          onEditPaper={(paperId) => router.push(`/dashboard/teacher/exams&quizzes/papers/${paperId}`)}
          onDelete={(exam) => console.log('Delete', exam)}
          onDuplicate={(exam) => console.log('Duplicate', exam)}
          onExport={(exam) => console.log('Export', exam)}
          startIndex={startIndex}
          currentTeacherId={currentTeacherId}
          authorizedSubjects={authorizedSubjects}
          authorizedSubjectIds={authorizedSubjectIds}
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