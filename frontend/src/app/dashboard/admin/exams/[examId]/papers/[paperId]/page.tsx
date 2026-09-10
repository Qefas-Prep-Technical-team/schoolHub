"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Settings, Loader2, Check, Globe } from "lucide-react";
import { toast } from "react-toastify";
import QuestionManager from "./components/QuestionManager";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import ReadingContentModal from "./components/ReadingContentModal";
import PaperPreviewModal from "./components/PaperPreviewModal";
import EditPaperModal from "./components/EditPaperModal";
import { useState } from "react";
import { BookOpen, Eye, Settings as SettingsIcon } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { classService } from "@/lib/api/services/classService";
import { sessionService } from "@/lib/api/services/sessionService";

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
    onConfirm: () => {},
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
                onClick={() => openConfirmDialog({
                  title: "Delete Paper",
                  description: `Permanently delete "${paper.title}"?`,
                  variant: "danger",
                  confirmText: "Delete",
                  onConfirm: () => deletePaperMutation.mutate()
                })}
                disabled={deletePaperMutation.isPending}
              >
                {deletePaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Question Manager ─────────────────────────────────────────── */}
        <QuestionManager
          paperId={paperId}
          examId={examId}
          paper={paper}
        />
      </main>


      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={unpublishPaperMutation.isPending || deletePaperMutation.isPending}
      />

      <ReadingContentModal
        isOpen={isReadingModalOpen}
        onClose={() => setIsReadingModalOpen(false)}
        paperId={paperId}
        initialContent={paper.readingContent}
        initialImages={paper.images}
        initialLabels={paper.imageLabels}
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
