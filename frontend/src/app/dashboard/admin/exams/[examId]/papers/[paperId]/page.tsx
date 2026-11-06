"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, FileText, Settings, Loader2, Check, Globe, Layers, ChevronDown,
  Users, Trash2, Clock, CheckCircle2, XCircle, Search, GraduationCap, CheckSquare, Square, X
} from "lucide-react";
import { toast } from "react-toastify";
import QuestionManager from "./components/QuestionManager";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import ReadingContentModal from "./components/ReadingContentModal";
import PaperPreviewModal from "./components/PaperPreviewModal";
import EditPaperModal from "./components/EditPaperModal";
import { useState, useMemo } from "react";
import { BookOpen, Eye, Settings as SettingsIcon } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { classService } from "@/lib/api/services/classService";
import { sessionService } from "@/lib/api/services/sessionService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { getDateGroupLabel, groupByDate } from "@/app/dashboard/student/my-classes/[id]/components/materials/utils/dateSectioning";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const examId = params.examId as string;
  const paperId = params.paperId as string;

  const { data: paper, isLoading: isLoadingPaper, isError: isErrorPaper } = useQuery({
    queryKey: ["paper", paperId],
    queryFn: () => examService.getPaperById(examId, paperId),
    enabled: !!paperId && !!examId,
  });

  const { data: exam, isLoading: isLoadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examService.getExamById(examId),
    enabled: !!examId,
  });

  const { data: examPapers = [] } = useQuery({
    queryKey: ["exam-papers", examId],
    queryFn: () => examService.getExamPapers(examId),
    enabled: !!examId && examId !== "none",
  });

  const queryClient = useQueryClient();

  const activeSchoolId = user?.schools?.[0]?.schoolId || (exam as any)?.schoolId;

  // Fetch Classes for the selector
  const { data: classesData } = useQuery({
    queryKey: ["school-classes", activeSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${activeSchoolId}`);
      return data.data || [];
    },
    enabled: !!activeSchoolId,
  });

  // Fetch Departments for the selector
  const { data: departmentsData } = useQuery({
    queryKey: ["school-departments", activeSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/departments?schoolId=${activeSchoolId}`);
      return data.data || [];
    },
    enabled: !!activeSchoolId,
  });

  // Fetch Sessions for the selector
  const { data: sessionsData } = useQuery({
    queryKey: ["school-sessions", activeSchoolId],
    queryFn: () => sessionService.getSessions(),
    enabled: !!activeSchoolId,
  });

  // Single-paper types skip the papers list — back goes straight to exam list
  const SINGLE_PAPER_TYPES = ['QUIZ', 'CA', 'ASSIGNMENT'];
  const isSinglePaperType = exam && (
    SINGLE_PAPER_TYPES.includes((exam as any).category || (exam as any).type || '') ||
    (exam as any).mode === 'SINGLE_SUBJECT'
  );
  const handleBack = () => {
    if (isSinglePaperType) {
      router.push('/dashboard/admin/exams');
    } else {
      router.push(`/dashboard/admin/exams/${examId}/papers`);
    }
  };


  // For single-paper types, publishing/unpublishing the paper also does the exam
  const publishExamMutation = useMutation({
    mutationFn: () => examService.publishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    },
  });

  const unpublishExamMutation = useMutation({
    mutationFn: () => examService.unpublishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
    },
  });

  const publishPaperMutation = useMutation({
    mutationFn: () => examService.publishPaper(examId, paperId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      if (isSinglePaperType && exam?.status !== 'PUBLISHED') {
        // Auto-publish the exam too — one step for single-paper types
        try {
          await publishExamMutation.mutateAsync();
          toast.success('Paper and exam published! Students now have access.');
        } catch {
          toast.success('Paper published. Publish the exam separately to give students access.');
        }
      } else {
        toast.success("Subject paper published successfully!");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Publish failed");
    }
  });

  const unpublishPaperMutation = useMutation({
    mutationFn: () => examService.unpublishPaper(examId, paperId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      if (isSinglePaperType && exam?.status === 'PUBLISHED') {
        // Auto-unpublish the exam too
        try {
          await unpublishExamMutation.mutateAsync();
          toast.success('Paper and exam unpublished. Students can no longer access.');
        } catch {
          toast.success('Paper unpublished.');
        }
      } else {
        toast.success("Subject paper unpublished!");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
    }
  });

  const deleteExamMutation = useMutation({
    mutationFn: () => examService.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      router.push("/dashboard/admin/exams");
      toast.success("Exam and paper deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete exam");
    }
  });

  const deletePaperMutation = useMutation({
    mutationFn: () => examService.deletePaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      router.push(`/dashboard/admin/exams/${examId}/papers`);
      toast.success("Subject paper deleted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete paper");
    }
  });

  // Fetch exam attempts to show student results & allow clearing
  const { data: rawAttempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => examService.getExamAttempts(examId),
    enabled: !!examId && examId !== "none",
  });

  // Filter attempts specifically for this paper
  const attempts = useMemo(() => {
    if (!Array.isArray(rawAttempts) || rawAttempts.length === 0) {
      // Fallback to paper.examAttempts if rawAttempts from exam is empty
      if (paper?.examAttempts && Array.isArray(paper.examAttempts) && paper.examAttempts.length > 0) {
        return paper.examAttempts.map((item: any) => {
          const parentAttempt = item.examAttempt || {};
          const student = parentAttempt.student || item.student || {};
          return {
            id: parentAttempt.id || item.id,
            studentId: parentAttempt.studentId || item.studentId || student.id,
            student,
            status: parentAttempt.status || "SCORED",
            totalScore: item.score ?? parentAttempt.totalScore ?? 0,
            totalMarks: item.totalMarks || paper.totalMarks || 100,
            subjectExamAttempts: [item],
            grades: parentAttempt.grades || paper.grades?.filter((g: any) => g.studentId === student.id) || [],
            createdAt: item.createdAt || parentAttempt.createdAt,
            submittedAt: item.submittedAt || parentAttempt.submittedAt,
          };
        });
      }
      return [];
    }

    return rawAttempts.filter((a: any) => {
      const subAttempts = a.subjectExamAttempts || a.subjectAttempts || [];
      return subAttempts.some((sa: any) => sa.subjectPaperId === paperId);
    });
  }, [rawAttempts, paper?.examAttempts, paper?.grades, paper?.totalMarks, paperId]);

  const [attemptsSearch, setAttemptsSearch] = useState("");
  const [attemptsPage, setAttemptsPage] = useState(1);
  const ATTEMPTS_PER_PAGE = 10;
  const [isAttemptsSelectionMode, setIsAttemptsSelectionMode] = useState(false);
  const [selectedAttemptStudentIds, setSelectedAttemptStudentIds] = useState<string[]>([]);

  const filteredAttempts = useMemo(() => {
    if (!attemptsSearch.trim()) return attempts;
    const q = attemptsSearch.toLowerCase();
    return attempts.filter((a: any) => {
      const name = (a.student?.name || "").toLowerCase();
      const code = (a.student?.studentCode || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [attempts, attemptsSearch]);

  const totalAttemptsPages = Math.ceil(filteredAttempts.length / ATTEMPTS_PER_PAGE);
  const paginatedAttempts = useMemo(() => {
    return filteredAttempts.slice((attemptsPage - 1) * ATTEMPTS_PER_PAGE, attemptsPage * ATTEMPTS_PER_PAGE);
  }, [filteredAttempts, attemptsPage]);

  // Group paginated attempts by date using date_sectioning_display skill
  const groupedAttempts = useMemo(() => {
    return groupByDate(paginatedAttempts, (attempt: any) => attempt.submittedAt || attempt.createdAt);
  }, [paginatedAttempts]);

  const handleToggleAttemptsSelectionMode = () => {
    setIsAttemptsSelectionMode((prev) => {
      if (prev) setSelectedAttemptStudentIds([]);
      return !prev;
    });
  };

  const handleToggleSelectAttempt = (studentId: string) => {
    setSelectedAttemptStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectSectionAttempts = (studentIds: string[], checked: boolean) => {
    if (checked) {
      setSelectedAttemptStudentIds((prev) => Array.from(new Set([...prev, ...studentIds])));
    } else {
      setSelectedAttemptStudentIds((prev) => prev.filter((id) => !studentIds.includes(id)));
    }
  };

  const allFilteredStudentIds = useMemo(() => {
    return Array.from(new Set(filteredAttempts.map((a: any) => a.studentId).filter(Boolean))) as string[];
  }, [filteredAttempts]);

  const isAllFilteredSelected =
    allFilteredStudentIds.length > 0 &&
    allFilteredStudentIds.every((id) => selectedAttemptStudentIds.includes(id));

  const handleSelectAllFilteredAttempts = () => {
    if (isAllFilteredSelected) {
      setSelectedAttemptStudentIds((prev) => prev.filter((id) => !allFilteredStudentIds.includes(id)));
    } else {
      setSelectedAttemptStudentIds((prev) => Array.from(new Set([...prev, ...allFilteredStudentIds])));
    }
  };

  // Mutation to clear an attempt so the student can retake the exam/paper
  const deleteAttemptMutation = useMutation({
    mutationFn: (studentId: string) => examService.deleteExamAttempt(examId, studentId),
    onSuccess: (_data, studentId) => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      setSelectedAttemptStudentIds((prev) => prev.filter((id) => id !== studentId));
      toast.success("Student record cleared. They can now retake the exam.");
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear student record");
    }
  });

  // Batch mutation to clear multiple attempts at once
  const batchDeleteAttemptsMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      await Promise.all(studentIds.map((studentId) => examService.deleteExamAttempt(examId, studentId)));
    },
    onSuccess: (_data, studentIds) => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      setSelectedAttemptStudentIds([]);
      setIsAttemptsSelectionMode(false);
      toast.success(`Cleared ${studentIds.length} student ${studentIds.length === 1 ? "record" : "records"}. They can now retake the exam.`);
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to clear selected student records");
    }
  });

  // Access Control check
  const isTeacher = user?.userType === "TEACHER";
  const isAdmin = user?.userType === "ADMIN";
  const isAssignedTeacher = paper?.teacherId === user?.id;
  const canAccess = isAdmin || (isTeacher && isAssignedTeacher);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: "danger" | "warning";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
    variant: "danger",
    confirmText: "Confirm",
  });

  const openConfirmDialog = (config: Partial<typeof confirmDialog>) => {
    setConfirmDialog({
      ...confirmDialog,
      ...config,
      isOpen: true,
    });
  };

  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch subjects and teachers for the edit modal
  const schoolId = exam?.schoolId;
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${schoolId}`);
      return data.data || data;
    },
    enabled: !!schoolId && isEditModalOpen,
  });

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${schoolId}/teachers`);
      return data.data || data;
    },
    enabled: !!schoolId && isEditModalOpen,
  });

  if (isLoadingPaper || isLoadingExam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800" />
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="space-y-4 w-full max-w-md">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="hidden lg:block space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isErrorPaper || !paper) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Paper Not Found</h2>
        <p className="text-gray-500 mb-6">The subject paper you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 text-center">
        <h2 className="text-xl font-bold text-amber-600 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You do not have permission to manage questions for this subject paper.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header Card ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Gradient top strip */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            {/* Left: back + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleBack}
                    className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap hover:underline"
                  >
                    {isSinglePaperType ? 'All Exams' : (exam?.title || 'Exam')}
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <h1 className="text-sm font-black text-slate-900 dark:text-white capitalize truncate">
                    {paper.title}
                  </h1>
                  {paper.status === "PUBLISHED" ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                      <Check size={9} /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 dark:border-amber-500/20">
                      Draft
                    </span>
                  )}
                  {/* For single-paper types, show the exam live status too */}
                  {isSinglePaperType && exam?.status === 'PUBLISHED' && (
                    <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/20">
                      <Globe size={9} /> Live
                    </span>
                  )}
                  {/* Multi-Paper Tag and Papers Dropdown */}
                  {!isSinglePaperType && examPapers && examPapers.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 cursor-pointer transition-colors">
                          <Layers size={10} />
                          <span>Multi-Paper ({examPapers.length})</span>
                          <ChevronDown size={10} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">All Exam Papers</p>
                        {examPapers.map((p: any, idx: number) => {
                          const pId = p.id;
                          const isCurrent = pId === paperId;
                          return (
                            <div
                              key={pId || idx}
                              onClick={() => {
                                if (!isCurrent) router.push(`/dashboard/admin/exams/${examId}/papers/${pId}`);
                              }}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-xl text-xs transition-colors",
                                isCurrent
                                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer text-slate-800 dark:text-slate-200"
                              )}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="truncate font-semibold">{p.title || p.subject?.name || 'Paper'}</p>
                                <p className="text-[10px] opacity-75">{p.subject?.name || ''}</p>
                              </div>
                              {isCurrent && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-100 shrink-0">Current</span>
                              )}
                            </div>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {paper.totalMarks} marks · {paper.durationMinutes} min
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Publish / Unpublish */}
              {paper.status === "PUBLISHED" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs px-3 font-bold gap-1.5"
                  onClick={() => openConfirmDialog({
                    title: isSinglePaperType ? 'Unpublish & Hide from Students' : 'Unpublish Paper',
                    description: isSinglePaperType
                      ? `This will unpublish both the paper and the exam. Students will immediately lose access to "${exam?.title}".`
                      : `Move "${paper.title}" back to draft?`,
                    variant: "warning",
                    confirmText: isSinglePaperType ? 'Unpublish Both' : 'Unpublish',
                    onConfirm: () => unpublishPaperMutation.mutate()
                  })}
                  disabled={unpublishPaperMutation.isPending || unpublishExamMutation.isPending}
                >
                  {(unpublishPaperMutation.isPending || unpublishExamMutation.isPending) ? <Loader2 className="animate-spin h-3 w-3" /> : 'Unpublish'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 px-4 text-xs font-bold gap-1.5"
                  onClick={() => publishPaperMutation.mutate()}
                  disabled={publishPaperMutation.isPending || publishExamMutation.isPending}
                >
                  {(publishPaperMutation.isPending || publishExamMutation.isPending) ? <Loader2 className="animate-spin h-3 w-3" /> : <Globe size={12} />}
                  {isSinglePaperType ? 'Publish' : 'Publish'}
                </Button>
              )}

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 text-xs px-3 font-semibold flex items-center gap-1.5"
                onClick={() => setIsReadingModalOpen(true)}
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">{paper.readingContent ? "Reading" : "Reading"}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs px-3 font-semibold flex items-center gap-1.5"
                onClick={() => setIsEditModalOpen(true)}
              >
                <SettingsIcon size={13} />
                <span className="hidden sm:inline">Settings</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xs px-3 font-bold flex items-center gap-1.5"
                onClick={() => setIsPreviewModalOpen(true)}
              >
                <Eye size={13} />
                <span className="hidden sm:inline">Preview</span>
              </Button>

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs px-3 font-semibold"
                onClick={() => {
                  if (isSinglePaperType) {
                    openConfirmDialog({
                      title: "Delete Paper & Assessment",
                      description: `This is a single-paper assessment. Deleting it will permanently delete both "${paper.title}" and the exam "${exam?.title || ''}".`,
                      variant: "danger",
                      confirmText: "Delete Paper & Exam",
                      onConfirm: () => deleteExamMutation.mutate()
                    });
                  } else {
                    openConfirmDialog({
                      title: "Delete Subject Paper",
                      description: `Permanently delete paper "${paper.title}" from "${exam?.title || 'Exam'}"? (Other subject papers in this exam will remain untouched).`,
                      variant: "danger",
                      confirmText: "Delete This Paper",
                      onConfirm: () => deletePaperMutation.mutate()
                    });
                  }
                }}
                disabled={deletePaperMutation.isPending || deleteExamMutation.isPending}
              >
                {(deletePaperMutation.isPending || deleteExamMutation.isPending) ? (
                  <Loader2 className="animate-spin h-3 w-3" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation: Questions vs Graded / Attempts ───────── */}
        <Tabs defaultValue="questions" className="w-full space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 grid grid-cols-2 w-full sm:w-80">
              <TabsTrigger
                value="questions"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <FileText size={14} className="shrink-0" />
                <span>Questions</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                  {paper.questions?.length || 0}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="graded"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <GraduationCap size={15} className="shrink-0" />
                <span>Graded</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                  {attempts.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Question Manager */}
          <TabsContent value="questions" className="mt-0 focus-visible:outline-none">
            <QuestionManager
              paperId={paperId}
              examId={examId}
              paper={paper}
            />
          </TabsContent>

          {/* Tab 2: Graded / Student Attempts */}
          <TabsContent value="graded" className="mt-0 focus-visible:outline-none">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Users size={19} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 dark:text-white text-base leading-tight flex items-center gap-2">
                      <span>Paper Attempts & Results</span>
                      {attempts.length > 0 && (
                        <span className="text-primary text-xs px-2 py-0.5 rounded-full bg-primary/10 font-black">
                          {attempts.length} {attempts.length === 1 ? "student" : "students"}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      All candidates who have attempted &quot;{paper.title}&quot;. Clear their attempt to allow a retake.
                    </p>
                  </div>
                </div>

                {/* Search Bar & Batch Selection Controls */}
                {attempts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search candidate..."
                        value={attemptsSearch}
                        onChange={(e) => {
                          setAttemptsSearch(e.target.value);
                          setAttemptsPage(1);
                        }}
                        className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {!isAttemptsSelectionMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleAttemptsSelectionMode}
                        className="h-9 rounded-xl px-3.5 text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <CheckSquare size={14} className="text-primary" />
                        <span>Select</span>
                      </Button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllFilteredAttempts}
                          className="h-9 rounded-xl px-3 text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {isAllFilteredSelected ? (
                            <>
                              <CheckSquare size={14} className="text-primary" />
                              <span>Deselect All</span>
                            </>
                          ) : (
                            <>
                              <Square size={14} className="text-slate-400" />
                              <span>Select All ({allFilteredStudentIds.length})</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={selectedAttemptStudentIds.length === 0 || batchDeleteAttemptsMutation.isPending}
                          onClick={() =>
                            openConfirmDialog({
                              title: `Clear ${selectedAttemptStudentIds.length} Student ${selectedAttemptStudentIds.length === 1 ? "Record" : "Records"}`,
                              description: `Delete the selected ${selectedAttemptStudentIds.length} student ${selectedAttemptStudentIds.length === 1 ? "attempt" : "attempts"} for "${paper.title}"? This clears their recorded answers and grades and allows them to take the exam again.`,
                              variant: "danger",
                              confirmText: `Clear ${selectedAttemptStudentIds.length} ${selectedAttemptStudentIds.length === 1 ? "Record" : "Records"}`,
                              onConfirm: () => batchDeleteAttemptsMutation.mutate(selectedAttemptStudentIds),
                            })
                          }
                          className="h-9 rounded-xl px-3.5 text-xs font-bold gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 cursor-pointer"
                        >
                          {batchDeleteAttemptsMutation.isPending ? (
                            <Loader2 className="animate-spin h-3.5 w-3.5" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          <span>Clear Selected ({selectedAttemptStudentIds.length})</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleToggleAttemptsSelectionMode}
                          className="h-9 rounded-xl px-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Exit selection mode"
                        >
                          <X size={14} />
                          <span className="ml-1">Cancel</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Table or Empty State */}
              {isLoadingAttempts ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : attempts.length === 0 ? (
                <div className="py-16 px-4 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-3xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 border border-slate-100 dark:border-slate-800">
                    <Users size={30} />
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-base mb-1">No Student Attempts Yet</h3>
                  <p className="text-xs font-medium text-slate-400 max-w-sm">
                    No students have submitted or started an attempt for this subject paper yet. Once students take the paper, their scores and status will appear here.
                  </p>
                </div>
              ) : filteredAttempts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No students matched your search &quot;{attemptsSearch}&quot;.
                </div>
              ) : (
                <div className="p-6 sm:p-8 space-y-6">
                  {groupedAttempts.map((section) => (
                    <div key={section.label} className="space-y-3">
                      {/* Section Header adhering to date_sectioning_display skill */}
                      <div className="flex items-center gap-2.5 px-1 py-1">
                        <div className="size-2 rounded-full bg-indigo-500 shadow-xs" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          {section.label}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                          {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>

                      {/* Section Table Container */}
                      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                              {isAttemptsSelectionMode && (
                                <th className="pl-6 sm:pl-8 pr-2 py-3.5 w-10">
                                  <input
                                    type="checkbox"
                                    checked={
                                      section.items.length > 0 &&
                                      section.items.every((a: any) => selectedAttemptStudentIds.includes(a.studentId))
                                    }
                                    onChange={(e) =>
                                      handleSelectSectionAttempts(
                                        section.items.map((a: any) => a.studentId).filter(Boolean),
                                        e.target.checked
                                      )
                                    }
                                    className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                                    aria-label={`Select all in ${section.label}`}
                                  />
                                </th>
                              )}
                              <th className={cn(isAttemptsSelectionMode ? "px-3" : "px-6 sm:px-8", "py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400")}>Student</th>
                              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Time Recorded</th>
                              <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Paper Score</th>
                              <th className="px-6 sm:px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {section.items.map((attempt: any) => {
                              // Find this specific subject paper attempt from subAttempts or direct attempt
                              const subAttempts = attempt.subjectExamAttempts || attempt.subjectAttempts || [];
                              const paperAttempt = subAttempts.find((sa: any) => sa.subjectPaperId === paperId) || subAttempts[0] || {};
                              const studentScore = paperAttempt.score ?? attempt.totalScore ?? 0;
                              const maxMarks = paperAttempt.totalMarks || paper.totalMarks || 100;
                              const scorePercent = maxMarks > 0 ? Math.round((studentScore / maxMarks) * 100) : 0;
                              const initials = (attempt.student?.name || "?")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                              const statusMap: Record<string, string> = {
                                SCORED: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
                                SUBMITTED: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
                                EXPIRED: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800",
                                IN_PROGRESS: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
                              };
                              const statusCls = statusMap[attempt.status] || statusMap.IN_PROGRESS;
                              const isSelected = selectedAttemptStudentIds.includes(attempt.studentId);

                              return (
                                <tr
                                  key={attempt.id || attempt.studentId}
                                  onClick={() => {
                                    if (isAttemptsSelectionMode && attempt.studentId) {
                                      handleToggleSelectAttempt(attempt.studentId);
                                    }
                                  }}
                                  className={cn(
                                    "group transition-colors",
                                    isAttemptsSelectionMode && "cursor-pointer",
                                    isAttemptsSelectionMode && isSelected
                                      ? "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/15"
                                      : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                                  )}
                                >
                                  {isAttemptsSelectionMode && (
                                    <td
                                      className="pl-6 sm:pl-8 pr-2 py-4 w-10"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleSelectAttempt(attempt.studentId)}
                                        className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                                        aria-label={`Select ${attempt.student?.name || "student"}`}
                                      />
                                    </td>
                                  )}

                                  {/* Student Column */}
                                  <td className={cn(isAttemptsSelectionMode ? "px-3" : "px-6 sm:px-8", "py-4")}>
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                        {initials}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                          {attempt.student?.name || "Student"}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                                          {attempt.student?.studentCode || attempt.student?.id?.slice(0, 8)}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Status Column */}
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${statusCls}`}>
                                      {attempt.status}
                                    </span>
                                  </td>

                                  {/* Time Recorded Column */}
                                  <td className="px-6 py-4">
                                    {attempt.createdAt || attempt.submittedAt ? (
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                          {format(new Date(attempt.submittedAt || attempt.createdAt), "MMM d, yyyy")}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400">
                                          {format(new Date(attempt.submittedAt || attempt.createdAt), "h:mm a")}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">—</span>
                                    )}
                                  </td>

                                  {/* Paper Score Column */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-black text-primary">{studentScore}</span>
                                      <span className="text-slate-300 dark:text-slate-700">/</span>
                                      <span className="text-xs font-bold text-slate-400">{maxMarks}</span>
                                      <span className="text-[10px] font-bold text-slate-400">({scorePercent}%)</span>
                                    </div>
                                  </td>

                                  {/* Action: Clear Record */}
                                  <td
                                    className="px-6 sm:px-8 py-4 text-right"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-end">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          openConfirmDialog({
                                            title: "Clear Student Record",
                                            description: `Delete ${attempt.student?.name || "this student"}'s attempt for "${paper.title}"? This clears their recorded answers and allows them to take the exam again.`,
                                            variant: "danger",
                                            confirmText: "Clear & Reset",
                                            onConfirm: () => deleteAttemptMutation.mutate(attempt.studentId),
                                          })
                                        }
                                        disabled={deleteAttemptMutation.isPending && (deleteAttemptMutation.variables as string) === attempt.studentId}
                                        className="h-8 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                        title="Clear record so student can retake"
                                      >
                                        {deleteAttemptMutation.isPending && (deleteAttemptMutation.variables as string) === attempt.studentId ? (
                                          <Loader2 className="animate-spin h-3.5 w-3.5" />
                                        ) : (
                                          <Trash2 size={13} />
                                        )}
                                        <span>Clear</span>
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalAttemptsPages > 1 && (
                    <div className="pt-2 flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttemptsPage((prev) => Math.max(prev - 1, 1))}
                        disabled={attemptsPage === 1}
                        className="rounded-xl font-bold h-8 px-3 text-xs"
                      >
                        Previous
                      </Button>
                      <span className="text-xs font-bold text-slate-400">
                        Page {attemptsPage} of {totalAttemptsPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttemptsPage((prev) => Math.min(prev + 1, totalAttemptsPages))}
                        disabled={attemptsPage === totalAttemptsPages}
                        className="rounded-xl font-bold h-8 px-3 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={
          unpublishPaperMutation.isPending ||
          deletePaperMutation.isPending ||
          deleteExamMutation.isPending ||
          deleteAttemptMutation.isPending ||
          batchDeleteAttemptsMutation.isPending
        }
      />

      <ReadingContentModal
        isOpen={isReadingModalOpen}
        onClose={() => setIsReadingModalOpen(false)}
        paperId={paperId}
        initialContent={paper.readingContent}
        initialImages={paper.images}
        initialLabels={paper.imageLabels}
        schoolId={activeSchoolId}
        subjectName={paper.subject?.name || exam?.title}
      />

      <PaperPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        paper={paper}
      />

      <EditPaperModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        paper={paper}
        exam={exam}
        isSinglePaperType={isSinglePaperType}
        subjects={subjects}
        teachers={teachers}
        classes={classesData}
        departments={departmentsData}
        sessions={sessionsData}
        isLoadingData={isLoadingSubjects || isLoadingTeachers}
      />
    </div>
  );
}
