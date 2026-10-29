'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ExamToolbar } from './components/ExamToolbar'
import { ExamTable } from './components/ExamTable'
import { ExamFilterDialog } from './components/ExamFilterDialog'
import { Exam, ExamFilter, ExamStatus, ExamType } from './components/types'
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
  const [filters, setFilters] = useState<ExamFilter>({})
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
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
      // Must strictly belong to this class if classId is defined on the exam
      if (e.classId && e.classId !== classId) return false;
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
      // Check if paper is linked to an exam for another class
      if (Array.isArray(p.exams) && p.exams.length > 0) {
        const hasMatchingClass = p.exams.some((pe: any) => {
          const ex = pe.exam || pe;
          return !ex?.classId || ex.classId === classId;
        });
        if (!hasMatchingClass) return false;
      }
      if (!hasAuthorizedFilter) return true;
      if (p.teacherId && currentTeacherId && p.teacherId === currentTeacherId) return true;
      const subId = p.subject?.id || p.subjectId;
      if (subId && authorizedSubjectIds.has(subId)) return true;
      const subName = (p.subject?.name || p.subject || '').toLowerCase();
      if (subName && authorizedSubjects.has(subName)) return true;
      return false;
    });

    const normalizeCategory = (cat?: string, title?: string): ExamType => {
      const c = (cat || '').toLowerCase().trim();
      const t = (title || '').toLowerCase().trim();
      if (c === 'exam' || c === 'terminal' || c === 'final') return 'exam';
      if (c === 'ca' || c === 'continuous_assessment') return 'ca';
      if (c === 'quiz' || c === 'class_test' || c === 'test') return 'quiz';
      if (c === 'assignment' || c === 'homework' || c === 'project') return 'assignment';
      if (t.includes('ca ') || t.includes(' ca') || t === 'ca' || t.includes('continuous assessment')) return 'ca';
      if (t.includes('quiz') || t.includes('class test') || t.includes('pop test')) return 'quiz';
      if (t.includes('assignment') || t.includes('homework') || t.includes('project')) return 'assignment';
      return 'exam';
    };

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

      const assessmentType = normalizeCategory(e.category, e.title);

      const examPaperTotalMarks = relevantSubjectPapers.reduce((sum: number, sep: any) => {
        const pMarks = Number(sep.totalMarks || sep.subjectPaper?.totalMarks || sep.paper?.totalMarks || 0);
        const qMarks = (sep.questions || sep.subjectPaper?.questions || sep.paper?.questions || []).reduce(
          (qSum: number, q: any) => qSum + (Number(q.marks) || 1),
          0
        );
        return sum + (pMarks > 0 ? pMarks : qMarks);
      }, 0);

      const calculatedTotalMarks = Number(e.totalMarks || 0) > 0 ? Number(e.totalMarks) : examPaperTotalMarks;

      const examPaperTotalQuestions = relevantSubjectPapers.reduce((sum: number, sep: any) => {
        return sum + Number(
          sep.questions?.length ||
          sep.totalQuestions ||
          sep._count?.questions ||
          sep.subjectPaper?.questions?.length ||
          sep.paper?.questions?.length ||
          0
        );
      }, 0);

      const calculatedQuestions = Number(e.totalQuestions || 0) > 0 ? Number(e.totalQuestions) : examPaperTotalQuestions;

      return {
      id: e.id,
      title: e.title,
      type: assessmentType,
      subjects: [
        ...(relevantSubjectPapers.map((sep: any) => sep.subjectPaper?.subject?.name || sep.subject?.name) || []),
        e.subject?.name || e.subject
      ].filter(Boolean),
      subjectIds: [
        ...(relevantSubjectPapers.map((sep: any) => sep.subjectPaper?.subject?.id || sep.subjectPaper?.subjectId || sep.subjectId || sep.subject?.id) || []),
        e.subject?.id || e.subjectId
      ].filter(Boolean),
      teacherId: e.teacherId,
      questions: calculatedQuestions,
      totalMarks: calculatedTotalMarks,
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
        const pQuestions = Number(sep.questions?.length || sep.totalQuestions || sep._count?.questions || sep.subjectPaper?.questions?.length || sep.paper?.questions?.length || 0);
        const pMarksRaw = Number(sep.totalMarks || sep.subjectPaper?.totalMarks || sep.paper?.totalMarks || 0);
        const qSumMarks = (sep.questions || sep.subjectPaper?.questions || sep.paper?.questions || []).reduce(
          (sum: number, q: any) => sum + (Number(q.marks) || 1),
          0
        );
        const pMarks = pMarksRaw > 0 ? pMarksRaw : qSumMarks;
        
        return {
          id: sep.id || sep.subjectPaperId || sep.subjectPaper?.id,
          title: title,
          subjectId: subjectId,
          subjectName: subjectName !== title ? subjectName : undefined,
          questionsCount: pQuestions,
          totalMarks: pMarks
        };
      })
    };
    }),
    ...filteredRawPapers.map((p: any) => {
      const assessmentType = normalizeCategory(p.category, p.title);
      const paperMarksRaw = Number(p.totalMarks || 0);
      const questionCount = Number(p.questionsCount || p.totalQuestions || p.questions?.length || p._count?.questions || 0);
      const questionsSum = Array.isArray(p.questions)
        ? p.questions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 1), 0)
        : questionCount;
      const calculatedPaperMarks = paperMarksRaw > 0 ? paperMarksRaw : questionsSum;

      return {
        id: p.id,
        title: p.title || 'Untitled Subject Paper',
        type: assessmentType,
        subjects: [p.subject?.name || p.subject].filter(Boolean),
        subjectIds: [p.subject?.id || p.subjectId].filter(Boolean),
        teacherId: p.teacherId,
        questions: questionCount,
        totalMarks: calculatedPaperMarks,
        scheduledDate: new Date(p.createdAt),
        status: p.status === 'APPROVED' ? 'published' : 'draft',
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        classId: classId,
        subjectPaperIds: [p.id],
        mySubjectPaperId: p.id
      };
    })
  ];
  }, [data, classId, authorizedSubjects, authorizedSubjectIds, currentTeacherId]);

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'exam' | 'ca' | 'quiz' | 'assignment'>('all');

  const counts = useMemo(() => {
    return {
      all: exams.length,
      exam: exams.filter((e) => e.type === 'exam').length,
      ca: exams.filter((e) => e.type === 'ca').length,
      quiz: exams.filter((e) => e.type === 'quiz').length,
      assignment: exams.filter((e) => e.type === 'assignment').length,
    };
  }, [exams]);

  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    exams.forEach(e => {
      (e.subjects || []).forEach(s => {
        if (s) subs.add(s);
      });
    });
    return Array.from(subs);
  }, [exams]);

  const [filteredExams, setFilteredExams] = useState<Exam[]>([])

  useEffect(() => {
    let filtered = exams

    // Apply subtab category filter (all, exam, ca, quiz, assignment)
    if (activeSubTab !== 'all') {
      filtered = filtered.filter((exam) => exam.type === activeSubTab)
    }

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

    if (filters.subject) {
      filtered = filtered.filter(exam =>
        (exam.subjects || []).some(s => s.toLowerCase() === filters.subject!.toLowerCase())
      )
    }

    if (filters.dateRange) {
      filtered = filtered.filter(exam =>
        exam.scheduledDate >= filters.dateRange!.start &&
        exam.scheduledDate <= filters.dateRange!.end
      )
    }

    setFilteredExams(filtered)
    setCurrentPage(1)
  }, [searchQuery, exams, filters, activeSubTab])

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
    setIsFilterDialogOpen(true);
  }

  if (isLoading) {
    return <TabSkeleton tabId="exams&quizzes" />;
  }
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExams = filteredExams.slice(startIndex, startIndex + itemsPerPage);

  return (
    < >
      <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

       

        {/* Assessment Category Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all' as const, label: 'All Assessments', count: counts.all },
            { id: 'exam' as const, label: 'Terminal Exams', count: counts.exam },
            { id: 'ca' as const, label: 'Continuous Assessment (CA)', count: counts.ca },
            { id: 'quiz' as const, label: 'Quizzes / Tests', count: counts.quiz },
            { id: 'assignment' as const, label: 'Assignments', count: counts.assignment },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

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

        <ExamFilterDialog
          open={isFilterDialogOpen}
          onClose={() => setIsFilterDialogOpen(false)}
          currentFilters={filters}
          onApply={(newFilters) => setFilters(newFilters)}
          availableSubjects={availableSubjects}
        />
      </div>
    </>
  )
}