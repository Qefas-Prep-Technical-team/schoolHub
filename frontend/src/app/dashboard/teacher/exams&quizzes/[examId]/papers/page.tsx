"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { examService } from "@/lib/api/services/examService";
import { teacherService } from "@/lib/api/services/teacherService";
import { CreatePaperForm } from "./components/CreatePaperForm";
import { sessionService } from "@/lib/api/services/sessionService";
import { Copy, FileText, Clock, Users, Check, Loader2, ShieldCheck, ChevronLeft, Settings2, Calendar, Trash2, Link as LinkIcon, Link2Off, Globe, Lock, Unlock, AlertCircle, Shuffle, Building2, Eye, Edit, BookOpen, User, List, LayoutGrid, Plus } from "lucide-react";
import { useUnlinkPaper } from "@/lib/api/hooks/useExams";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import AddExistingPaperModal from "@/app/dashboard/admin/exams/components/AddExistingPaperModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ConfirmationModal from "@/app/dashboard/admin/exams/components/ui/ConfirmationModal";

export default function ExamPapersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schoolId = user?.schools?.[0]?.schoolId; // Assuming user is associated with at least one school
  const params = useParams();
  const examId = params.examId as string;

  const queryClient = useQueryClient();

  const { data: exam, isLoading: isLoadingExam, isError: isErrorExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examService.getExamById(examId),
    enabled: !!examId,
  });

  const { data: papers = [], isLoading: isLoadingPapers, isError: isErrorPapers } = useQuery({
    queryKey: ["exam-papers", examId],
    queryFn: () => examService.getExamPapers(examId),
    enabled: !!examId,
  });

  // Auto-redirect: if this exam has exactly 1 paper, go straight to the paper edit page
  useEffect(() => {
    if (!isLoadingPapers && papers.length === 1) {
      router.replace(`/dashboard/teacher/exams&quizzes/papers/${(papers[0] as any).id}`);
    }
  }, [papers, isLoadingPapers, router]);

  const validateExamMutation = useMutation({
    mutationFn: () => examService.validateExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam validated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Exam validation failed");
    }
  });

  const publishExamMutation = useMutation({
    mutationFn: () => examService.publishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam published successfully!");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Exam publish failed");
    }
  });

  const unpublishExamMutation = useMutation({
    mutationFn: () => examService.unpublishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam unpublished successfully!");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unpublish exam");
    }
  });

  const deleteExamMutation = useMutation({
    mutationFn: () => examService.deleteExam(examId),
    onSuccess: () => {
      router.push("/dashboard/teacher/exams&quizzes");
      toast.success("Exam deleted successfully");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete exam");
    }
  });

  const unpublishPaperMutation = useMutation({
    mutationFn: (paperId: string) => examService.unpublishPaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      toast.success("Subject paper unpublished!");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
    }
  });

  const unlinkPaperMutation = useUnlinkPaper(examId);

  const { data: attempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => examService.getExamAttempts(examId),
    enabled: !!examId,
  });

  const [attemptsPage, setAttemptsPage] = useState(1);
  const ATTEMPTS_PER_PAGE = 10;
  const totalAttemptsPages = Math.ceil(attempts.length / ATTEMPTS_PER_PAGE);
  const paginatedAttempts = attempts.slice((attemptsPage - 1) * ATTEMPTS_PER_PAGE, attemptsPage * ATTEMPTS_PER_PAGE);

  const deleteAttemptMutation = useMutation({
    mutationFn: (studentId: string) => examService.deleteExamAttempt(examId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      toast.success("Student record cleared. They can now retake the exam.");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete attempt");
    }
  });

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

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [participantsViewMode, setParticipantsViewMode] = useState<'table' | 'grid'>('grid');

  // Default to grid layout on mobile screens (< 768px), list/table on desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setViewMode('grid');
        setParticipantsViewMode('grid');
      } else {
        setViewMode('list');
        setParticipantsViewMode('table');
      }
    }
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [examSettings, setExamSettings] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    resultReleaseAt: "",
    allowImmediateResult: false,
    shuffleQuestions: false,
    scope: "SCHOOL",
    classId: "",
    departmentIds: [] as string[],
    durationMinutes: 0,
    sessionId: "",
    term: "",
    teacherId: "",
  });

  // Use the school ID associated with the exam for all contextual fetches
  const activeSchoolId = user?.schools?.[0]?.schoolId|| schoolId;

  // Fetch Classes for the selector
  const { data: classesData } = useQuery({
    queryKey: ["school-classes", activeSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${activeSchoolId}`);
      return data.data || [];
    },
    enabled: isSettingsOpen && !!activeSchoolId,
  });

  // Fetch Departments for the selector
  const { data: departmentsData } = useQuery({
    queryKey: ["school-departments", activeSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/departments?schoolId=${activeSchoolId}`);
      return data.data || [];
    },
    enabled: isSettingsOpen && !!activeSchoolId,
  });

  // Fetch Sessions for the selector
  const { data: sessionsData } = useQuery({
    queryKey: ["school-sessions", activeSchoolId],
    queryFn: () => sessionService.getSessions(),
    enabled: isSettingsOpen && !!activeSchoolId,
  });

  // Sync settings when scope changes
  useEffect(() => {
    if (examSettings.scope === "SCHOOL") {
      // For school scope, class and department are optional filters
    } else if (examSettings.scope === "CLASS") {
      setExamSettings(prev => ({ ...prev, departmentIds: [] }));
    } else if (examSettings.scope === "DEPARTMENT") {
      setExamSettings(prev => ({ ...prev, classId: "" }));
    }

    if (examSettings.allowImmediateResult) {
      setExamSettings(prev => ({ ...prev, resultReleaseAt: "" }));
    }
  }, [examSettings.scope, examSettings.allowImmediateResult]);

  useEffect(() => {
    if (exam && isSettingsOpen) {
      setExamSettings({
        title: exam.title || "",
        description: exam.description || "",
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : "",
        endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : "",
        resultReleaseAt: exam.resultReleaseAt ? new Date(exam.resultReleaseAt).toISOString().slice(0, 16) : "",
        allowImmediateResult: !!exam.allowImmediateResult,
        scope: exam.scope || "SCHOOL",
        classId: exam.classId || "",
        departmentIds: exam.departments?.map((d: any) => d.departmentId || d.department?.id) || [],
        durationMinutes: exam.durationMinutes || 0,
        sessionId: exam.sessionId || "",
        term: exam.term || "",
        teacherId: exam.teacherId || "",
        shuffleQuestions: !!exam.shuffleQuestions,
      });
    }
  }, [exam, isSettingsOpen]);

  // ── Single-paper exam type logic ────────────────────────────────────────
  const SINGLE_PAPER_TYPES = ['QUIZ', 'CA', 'ASSIGNMENT'];
  const isSinglePaperType = exam && SINGLE_PAPER_TYPES.includes((exam as any).category || (exam as any).type || '');
  const isExamWithOnePaper = !isSinglePaperType && papers.length === 1;

  // Auto-redirect when a paper already exists
  useEffect(() => {
    if (isLoadingExam || isLoadingPapers) return;
    if (!exam || papers === undefined) return;
    if ((isSinglePaperType && papers.length === 1) || isExamWithOnePaper) {
      router.replace(`/dashboard/teacher/exams&quizzes/papers/${papers[0].id}`);
    }
  }, [exam, papers, isLoadingExam, isLoadingPapers]);

  // Auto-create mutation for single-paper types with no paper yet
  const [quickSetupTitle, setQuickSetupTitle] = useState('');
  const [quickSetupDuration, setQuickSetupDuration] = useState(60);
  const [quickSetupInstructions, setQuickSetupInstructions] = useState('Answer all questions carefully.');

  const autoCreatePaperMutation = useMutation({
    mutationFn: () => examService.createSubjectPaper(examId, {
      title: quickSetupTitle || (exam?.title ?? 'Paper'),
      instructions: quickSetupInstructions,
      durationMinutes: quickSetupDuration,
      schoolId: activeSchoolId ?? undefined,
    }),
    onSuccess: (newPaper) => {
      queryClient.invalidateQueries({ queryKey: ['exam-papers', examId] });
      router.push(`/dashboard/teacher/exams&quizzes/${examId}/papers/${newPaper.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create paper');
    },
  });


  const updateExamMutation = useMutation({
    mutationFn: (data: any) => examService.updateExam(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam settings updated!");
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update exam settings");
    }
  });

  const allPapersPublished = papers.length > 0 && papers.every(p => p.status === "PUBLISHED");
  const isPublished = exam?.status === "PUBLISHED";
  const { data: subjectResponse, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${activeSchoolId}`);
      // Based on your previous session data structure, 
      // your API likely wraps the array in a 'data' property
      return data.data || data;
    },
  });

  // 2. Fetch Teachers
  const { data: teacherResponse, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["all-teachers", activeSchoolId],
    queryFn: async () => {
      // console.log("Fetching teachers for school ID:", activeSchoolId); // Debug log
      // Adjust this URL to match your actual backend route
      const { data } = await apiClient.get(`/schools/${activeSchoolId}/teachers`);
      return data.data || data;
    },
    enabled: !!activeSchoolId,
  });
  // Fetch subjects assigned to this teacher
  const { data: teacherAssignedSubjects = [] } = useQuery({
    queryKey: ['teacher-assigned-subjects', activeSchoolId],
    queryFn: () => teacherService.getSubjects(activeSchoolId ? { schoolId: activeSchoolId } : {}),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.userType === 'TEACHER',
  });

  const mySubjectIds = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(teacherAssignedSubjects)) {
      teacherAssignedSubjects.forEach((s: any) => {
        if (s.id) set.add(s.id);
        if (s.subjectId) set.add(s.subjectId);
      });
    }
    return set;
  }, [teacherAssignedSubjects]);

  const copyExamId = () => {
    navigator.clipboard.writeText(examId);
    toast.success("Exam ID copied!");
  };

  // Category display helpers
  const categoryMeta: Record<string, { label: string; color: string; icon: string }> = {
    QUIZ:       { label: 'Quiz',       color: 'indigo',  icon: '📝' },
    CA:         { label: 'C.A.',       color: 'emerald', icon: '📊' },
    ASSIGNMENT: { label: 'Assignment', color: 'amber',   icon: '📋' },
    EXAM:       { label: 'Exam',       color: 'primary', icon: '📄' },
  };
  const catKey = (exam as any)?.category || (exam as any)?.type || 'EXAM';
  const cat = categoryMeta[catKey] ?? categoryMeta.EXAM;


  if (isLoadingExam) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="lg:col-span-2 h-80 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (isErrorExam) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6">
          <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-black text-red-700 dark:text-red-400">Error loading exam</p>
            <p className="text-sm text-red-500 mt-0.5">This exam might not exist or you lack permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Derived display values ────────────────────────────────────────────────
  const totalMarks   = papers.reduce((s, p) => s + (p.totalMarks || 0), 0);
  const totalMins    = papers.reduce((s, p) => s + (p.durationMinutes || 0), 0);
  const publishedCnt = papers.filter(p => p.status === "PUBLISHED").length;

  // ── Redirect shimmer — paper exists, waiting for router.replace ────────────
  if (!isLoadingExam && !isLoadingPapers && ((isSinglePaperType && papers.length === 1) || isExamWithOnePaper)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={28} className="animate-spin text-primary" />
          <p className="text-sm font-bold">Opening paper editor…</p>
        </div>
      </div>
    );
  }

  // ── Quick Setup screen — single-paper type with no paper yet ───────────────
  if (!isLoadingExam && !isLoadingPapers && isSinglePaperType && papers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        {/* Minimal top bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/teacher/exams&quizzes')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm font-bold"
          >
            <ChevronLeft size={16} /> All Exams
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{exam?.title}</span>
          <span className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest">{cat.label}</span>
        </div>

        {/* Setup card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 text-3xl sm:text-4xl mb-3 sm:mb-4">
                {cat.icon}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{cat.label} Setup</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2 font-medium">
                Configure your <span className="text-primary font-bold">{cat.label}</span> paper. You can always edit these details later.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Paper Title
                </label>
                <input
                  type="text"
                  placeholder={exam?.title || `${cat.label} Paper`}
                  value={quickSetupTitle}
                  onChange={e => setQuickSetupTitle(e.target.value)}
                  className="w-full h-11 sm:h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-[10px] text-slate-400 font-medium">Leave blank to use the exam title</p>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Duration (Minutes)
                </label>
                <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3">
                  {[15, 30, 45, 60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setQuickSetupDuration(mins)}
                      className={`h-9 sm:h-10 sm:flex-1 rounded-xl border text-xs font-black transition-all ${
                        quickSetupDuration === mins
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/25'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={12} className="text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    value={quickSetupDuration}
                    onChange={e => setQuickSetupDuration(parseInt(e.target.value) || 60)}
                    className="w-24 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 text-sm font-bold outline-none focus:border-primary transition-all"
                  />
                  <span className="text-xs text-slate-400 font-medium">minutes</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Student Instructions
                </label>
                <textarea
                  rows={3}
                  value={quickSetupInstructions}
                  onChange={e => setQuickSetupInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={() => autoCreatePaperMutation.mutate()}
                disabled={autoCreatePaperMutation.isPending}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {autoCreatePaperMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating paper…</>
                ) : (
                  <><FileText size={16} /> Create &amp; Start Adding Questions</>
                )}
              </button>
            </div>

            {/* Info note */}
            <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
              A {cat.label} only has one paper. You can rename it, add reading content, and configure marking after creation.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-700/50">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 pb-5 sm:pb-6">
          {/* Breadcrumb row */}
          <button
            onClick={() => router.push('/dashboard/teacher/exams&quizzes')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-bold mb-3 sm:mb-4 group"
          >
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            All Examinations
          </button>

          {/* Title + status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    {exam?.title || "Exam Papers"}
                  </h1>
                  {isPublished ? (
                    <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-widest">
                      <Check size={9} /> Published
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-widest">
                      {exam?.status || "Draft"}
                    </span>
                  )}
                </div>
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-slate-400 text-[11px] sm:text-xs font-bold mt-1">
                  <button onClick={copyExamId} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                    <span className="font-mono text-slate-500 group-hover:text-slate-300">{examId.slice(0, 8)}…</span>
                    <Copy size={11} />
                  </button>
                  {exam?.startDate && (
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <Calendar size={11} />
                      {format(new Date(exam.startDate), "MMM d, yyyy")}
                    </div>
                  )}
                  {exam?.durationMinutes && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {exam.durationMinutes} min
                    </div>
                  )}
                  {exam?.scope && (
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <Globe size={11} />
                      {exam.scope.charAt(0) + exam.scope.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:flex sm:items-center w-full sm:w-auto bg-white/5 border border-white/10 rounded-2xl p-2 sm:px-4 sm:py-2.5 gap-2 sm:gap-0">
              {[
                { label: "Papers",  value: papers.length, color: "text-white" },
                { label: "Marks",   value: totalMarks,    color: "text-primary" },
                { label: "Minutes", value: totalMins,     color: "text-indigo-400" },
                { label: "Attempts",value: attempts.length, color: "text-emerald-400" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] sm:bg-transparent sm:px-4 sm:py-0 border border-white/5 sm:border-0 ${
                    i > 0 ? "sm:border-l sm:border-white/10" : ""
                  }`}
                >
                  <span className={`text-lg sm:text-xl font-black leading-none ${s.color}`}>{s.value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-slate-500 mt-1 sm:mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action Toolbar ── */}
          <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10">
            {/* Primary: Publish / Unpublish */}
            {!isPublished ? (
              <button
                onClick={() => openConfirmDialog({
                  title: "Publish Examination",
                  description: `Publish "${exam?.title}"? Students will immediately gain access.`,
                  variant: "warning",
                  confirmText: "Publish Exam",
                  onConfirm: () => publishExamMutation.mutate()
                })}
                disabled={publishExamMutation.isPending || !allPapersPublished}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:grayscale text-white font-black text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                {publishExamMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
                Publish Exam
              </button>
            ) : (
              <button
                onClick={() => openConfirmDialog({
                  title: "Unpublish Exam",
                  description: `Unpublish "${exam?.title}"? Student access will be restricted immediately.`,
                  variant: "warning",
                  confirmText: "Unpublish",
                  onConfirm: () => unpublishExamMutation.mutate()
                })}
                disabled={unpublishExamMutation.isPending}
                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-black text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95"
              >
                {unpublishExamMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                Unpublish
              </button>
            )}

            {/* Settings */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all">
                  <Settings2 size={15} /> Settings
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-5xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 focus:outline-none bg-slate-50 dark:bg-slate-950">
                <div className="bg-white dark:bg-slate-900 p-8 pb-6 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <Settings2 size={24} />
                      </div>
                      <div>
                        Edit Exam Settings
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Refine the global parameters and targeting for this examination.</p>
                      </div>
                    </DialogTitle>
                    <DialogDescription className="hidden">Settings for exam</DialogDescription>
                  </DialogHeader>
                </div>

                <div className="p-8 pt-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-800/50 pb-4">
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><FileText size={18} /></div>
                          <Label className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">General Info</Label>
                        </div>
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-bold text-slate-600 dark:text-slate-400">Exam Title</Label>
                            <Input id="title" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-12" value={examSettings.title} onChange={(e) => setExamSettings({ ...examSettings, title: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold text-slate-600 dark:text-slate-400">Instructions / Description</Label>
                            <Textarea id="description" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 min-h-[120px] resize-none" value={examSettings.description} onChange={(e) => setExamSettings({ ...examSettings, description: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-800/50 pb-4">
                          <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"><Calendar size={18} /></div>
                          <Label className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Timing &amp; Schedule</Label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Start Date</Label>
                            <Input type="datetime-local" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-12" value={examSettings.startDate} onChange={(e) => setExamSettings({ ...examSettings, startDate: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">End Date</Label>
                            <Input type="datetime-local" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-12" value={examSettings.endDate} onChange={(e) => setExamSettings({ ...examSettings, endDate: e.target.value })} />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Clock size={12} /> Duration (Minutes)</Label>
                            <Input type="number" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-12" value={examSettings.durationMinutes} onChange={(e) => setExamSettings({ ...examSettings, durationMinutes: parseInt(e.target.value) || 0 })} />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2"><Shuffle size={16} className="text-indigo-500" /> Shuffle Questions</Label>
                            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">Randomize question order for every student attempt.</p>
                          </div>
                          <Switch checked={examSettings.shuffleQuestions} onCheckedChange={(checked) => setExamSettings({ ...examSettings, shuffleQuestions: checked })} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-800/50 pb-4">
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><Users size={18} /></div>
                          <Label className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Targeting &amp; Scope</Label>
                        </div>
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Exam Scope</Label>
                            <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer" value={examSettings.scope} onChange={(e) => setExamSettings({ ...examSettings, scope: e.target.value as any })}>
                              <option value="SCHOOL">Whole School</option>
                              <option value="CLASS">By Class Group</option>
                              <option value="DEPARTMENT">By Academic Department</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Class</Label>
                            <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer" value={examSettings.classId} onChange={(e) => setExamSettings({ ...examSettings, classId: e.target.value })}>
                              <option value="">No specific class</option>
                              {classesData?.map((c: any) => (<option key={c.id} value={c.id}>{c.name} {c.section}</option>))}
                            </select>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Departments <span className="font-normal text-slate-400">(Optional)</span></Label>
                              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{examSettings.departmentIds?.length || 0} Selected</span>
                            </div>
                            {departmentsData && departmentsData.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {departmentsData.map((d: any) => {
                                  const isSelected = examSettings.departmentIds?.includes(d.id);
                                  return (
                                    <div key={d.id} onClick={() => { const current = examSettings.departmentIds || []; const next = current.includes(d.id) ? current.filter((id) => id !== d.id) : [...current, d.id]; setExamSettings({ ...examSettings, departmentIds: next }); }} className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}>
                                      <div className={`w-4 h-4 flex-shrink-0 rounded flex items-center justify-center border ${isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                                      <span className="text-xs font-bold truncate">{d.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800">{activeSchoolId ? "No departments available" : "Select a school first"}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-800/50 pb-4">
                          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><Building2 size={18} /></div>
                          <Label className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Academic Context</Label>
                        </div>
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Session</Label>
                              <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm outline-none focus:border-indigo-500 cursor-pointer" value={examSettings.sessionId} onChange={(e) => setExamSettings({ ...examSettings, sessionId: e.target.value })}>
                                <option value="">No specific session</option>
                                {sessionsData?.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Term</Label>
                              <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm outline-none focus:border-indigo-500 cursor-pointer" value={examSettings.term} onChange={(e) => setExamSettings({ ...examSettings, term: e.target.value as any })}>
                                <option value="">No specific term</option>
                                <option value="FIRST">First Term</option>
                                <option value="SECOND">Second Term</option>
                                <option value="THIRD">Third Term</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Global Teacher (Optional)</Label>
                            <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm outline-none focus:border-indigo-500 cursor-pointer" value={examSettings.teacherId} onChange={(e) => setExamSettings({ ...examSettings, teacherId: e.target.value })}>
                              <option value="">No global teacher assigned</option>
                              {Array.isArray(teacherResponse) && teacherResponse.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                              {Array.isArray(teacherResponse?.data) && teacherResponse.data.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-800/50 pb-4">
                          <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"><Eye size={18} /></div>
                          <Label className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Results Settings</Label>
                        </div>
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Visibility Timing</Label>
                            <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm outline-none focus:border-indigo-500 cursor-pointer" value={examSettings.allowImmediateResult ? "immediate" : "scheduled"} onChange={(e) => setExamSettings({ ...examSettings, allowImmediateResult: e.target.value === "immediate" })}>
                              <option value="immediate">Show results immediately after submission</option>
                              <option value="scheduled">Hold results until specific release date</option>
                            </select>
                          </div>
                          {!examSettings.allowImmediateResult && (
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Result Release Date &amp; Time</Label>
                              <Input type="datetime-local" className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-12" value={examSettings.resultReleaseAt} onChange={(e) => setExamSettings({ ...examSettings, resultReleaseAt: e.target.value })} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 rounded-b-[2.5rem]">
                  <DialogFooter className="w-full flex sm:justify-between items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
                      <AlertCircle size={14} />
                      <p className="text-[11px] font-bold tracking-wide uppercase">Updating settings immediately affects visibility</p>
                    </div>
                    <div className="flex gap-3 ml-auto w-full sm:w-auto">
                      <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="flex-1 sm:flex-none rounded-xl font-bold h-12 px-6">Cancel</Button>
                      <Button onClick={() => updateExamMutation.mutate(examSettings)} disabled={updateExamMutation.isPending} className="flex-1 sm:flex-none rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 h-12 px-8">
                        {updateExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>


            {/* Delete — admin only */}
            {user?.userType === "ADMIN" && (
              <button
                onClick={() => openConfirmDialog({
                  title: "Delete Exam",
                  description: `Permanently delete "${exam?.title}" and all its papers. This cannot be undone.`,
                  variant: "danger",
                  confirmText: "Delete Exam",
                  onConfirm: () => deleteExamMutation.mutate()
                })}
                disabled={deleteExamMutation.isPending}
                className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 font-bold text-sm px-4 py-2.5 rounded-xl transition-all ml-auto"
              >
                {deleteExamMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
            )}
          </div>

          {/* Not-all-published warning */}
          {!allPapersPublished && !isPublished && papers.length > 0 && (
            <div className="flex items-center gap-3 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-amber-400">
              <AlertCircle size={14} className="flex-shrink-0" />
              <p className="text-xs font-bold">All subject papers must be published before the full examination can be released. ({publishedCnt}/{papers.length} published)</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BODY
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 sm:gap-8 items-start max-w-[1600px] mx-auto">

        {/* ── Sidebar: Add paper (Shown 2nd on mobile, 1st on desktop) ── */}
        <div id="add-subject-paper-section" className="order-2 lg:order-1 space-y-5 lg:sticky lg:top-6">
          {/* Create form card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={18} />
              </div>
              <h2 className="font-black text-slate-900 dark:text-white text-base">Add Subject Paper</h2>
            </div>
            <CreatePaperForm
              examId={examId}
              subjects={Array.isArray(subjectResponse) ? subjectResponse : []}
              isLoadingData={isLoadingSubjects || isLoadingTeachers}
              teachers={Array.isArray(teacherResponse) ? teacherResponse : []}
            />

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Link</p>
              <AddExistingPaperModal
                examId={examId}
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-2xl border-dashed border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-bold text-sm">
                    <LinkIcon className="h-4 w-4" />
                    Link Existing Paper
                  </Button>
                }
              />
              <p className="text-[10px] text-slate-400 mt-2.5 text-center font-medium">Reuse papers from other exams or saved drafts.</p>
            </div>
          </div>

          {/* Validate button (if available) */}
          <button
            onClick={() => validateExamMutation.mutate()}
            disabled={validateExamMutation.isPending}
            className="w-full flex items-center justify-center gap-2 h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-2xl transition-all"
          >
            {validateExamMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            Validate Exam
          </button>
        </div>

        {/* ── Papers Section (Shown 1st on mobile, 2nd on desktop) ── */}
        <div className="order-1 lg:order-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Subject Papers</span>
                {papers.length > 0 && (
                  <span className="text-xs font-black bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                    {papers.length}
                  </span>
                )}
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                {publishedCnt} of {papers.length} papers published
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="List View"
                >
                  <List size={16} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Mobile Quick Action to Add Paper */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('add-subject-paper-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-emerald-500/40 dark:border-emerald-400/30 px-3 py-2 rounded-xl shadow-sm shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={14} className="stroke-[2.5]" />
                <span>Add Paper</span>
              </button>
            </div>
          </div>

          {isLoadingPapers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : isErrorPapers ? (
            <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-6">
              <AlertCircle size={20} className="text-red-500" />
              <p className="font-bold text-red-600 dark:text-red-400">Failed to load examination papers.</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 px-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4 sm:mb-5">
                <FileText size={32} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">No papers yet</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-xs font-medium">Add a subject paper using the form to get started.</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {papers.map((paper, idx) => {
                const isTeacher = user?.userType === "TEACHER";
                const isAdmin   = user?.userType === "ADMIN";
                const isExamCreator = exam?.teacherId === user?.id;
                const isPaperCreator = paper.teacherId === user?.id;
                const isDirectlyAssigned = (paper as any).assignedTeachers?.some((t: any) => t.id === user?.id);
                const subjectObj = paper.subject as any;
                const isSubjectAssigned = Boolean(
                  (paper.subjectId && mySubjectIds.has(paper.subjectId)) ||
                  (subjectObj?.id && mySubjectIds.has(subjectObj.id)) ||
                  subjectObj?.teacherId === user?.id ||
                  subjectObj?.teacherSubjects?.some((ts: any) => ts.teacherId === user?.id || ts.teacher?.id === user?.id)
                );

                const canAccess = isAdmin || isExamCreator || (isTeacher && (isPaperCreator || isDirectlyAssigned || isSubjectAssigned));
                const isPublishedPaper = paper.status === "PUBLISHED";

                const statusStyle = isPublishedPaper
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800";

                return (
                  <div
                    key={paper.id}
                    onClick={() => {
                      if (canAccess) {
                        router.push(`/dashboard/teacher/exams&quizzes/papers/${paper.id}`);
                      } else {
                        toast.info("Only teachers assigned to this subject, paper creator, or admins can manage this paper.");
                      }
                    }}
                    className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all duration-200 ${
                      canAccess
                        ? "border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/5 cursor-pointer active:scale-[0.99]"
                        : "border-slate-200 dark:border-slate-800 opacity-75 cursor-not-allowed"
                    }`}
                  >
                    {/* Top Accent Strip */}
                    <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full ${isPublishedPaper ? "bg-emerald-400" : "bg-amber-400"}`} />

                    <div>
                      {/* Top Bar: Icon, Number, & Action Buttons */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${
                            canAccess
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}>
                            <FileText size={20} />
                          </div>
                          <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {canAccess && (
                            <Link
                              href={`/dashboard/teacher/exams&quizzes/papers/${paper.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 sm:px-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700/60 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                title="Edit Subject Paper"
                              >
                                <Edit size={13} className="stroke-[2.5]" />
                                <span>Edit</span>
                              </Button>
                            </Link>
                          )}
                          {canAccess && isPublishedPaper && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl cursor-pointer"
                              title="Unpublish Paper"
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirmDialog({
                                  title: "Unpublish Paper",
                                  description: `Unpublish "${paper.title}"? It will move back to draft.`,
                                  variant: "warning",
                                  confirmText: "Unpublish",
                                  onConfirm: () => unpublishPaperMutation.mutate(paper.id),
                                });
                              }}
                            >
                              {unpublishPaperMutation.isPending && unpublishPaperMutation.variables === paper.id ? (
                                <Loader2 className="animate-spin h-3.5 w-3.5" />
                              ) : (
                                <Unlock size={15} />
                              )}
                            </Button>
                          )}
                          {canAccess && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer"
                              title="Unlink Paper"
                              onClick={(e) => {
                                e.stopPropagation();
                                openConfirmDialog({
                                  title: "Unlink Paper",
                                  description: `Remove "${paper.title}" from this exam?`,
                                  variant: "warning",
                                  confirmText: "Unlink Paper",
                                  onConfirm: () => unlinkPaperMutation.mutate(paper.id),
                                });
                              }}
                            >
                              {unlinkPaperMutation.isPending && unlinkPaperMutation.variables === paper.id ? (
                                <Loader2 className="animate-spin h-3.5 w-3.5" />
                              ) : (
                                <Link2Off size={15} />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${statusStyle}`}>
                          {isPublishedPaper ? <Check size={9} /> : null}
                          {paper.status}
                        </span>
                        {paper.subject?.name && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {paper.subject.name}
                          </span>
                        )}
                        {isPaperCreator && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            <User size={9} /> Creator
                          </span>
                        )}
                        {!isPaperCreator && isSubjectAssigned && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            <BookOpen size={9} /> Your Subject
                          </span>
                        )}
                        {!canAccess && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            <Lock size={9} /> Locked
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {paper.title}
                      </h3>
                    </div>

                    {/* Bottom: Metrics + Timestamp */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <Clock size={12} className="text-primary/70 flex-shrink-0" />
                          <span className="truncate">{paper.durationMinutes} min</span>
                        </div>
                        {paper.totalMarks != null ? (
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <ShieldCheck size={12} className="text-indigo-400 flex-shrink-0" />
                            <span className="truncate">{paper.totalMarks} marks</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <FileText size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">Paper</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3 text-[11px] font-bold text-slate-400">
                        <div className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300">
                          <Users size={11} className="text-blue-400 flex-shrink-0" />
                          <span className="truncate">
                            {isPaperCreator
                              ? "You (Creator)"
                              : isSubjectAssigned
                              ? "You (Subject Teacher)"
                              : (paper.teacher?.name || (paper.teacherId ? "Assigned" : "Unassigned"))}
                          </span>
                        </div>
                        <span className="flex-shrink-0 text-slate-400">
                          {format(new Date((paper as any).updatedAt || new Date()), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
              {papers.map((paper, idx) => {
                const isTeacher = user?.userType === "TEACHER";
                const isAdmin   = user?.userType === "ADMIN";
                const isExamCreator = exam?.teacherId === user?.id;
                const isPaperCreator = paper.teacherId === user?.id;
                const isDirectlyAssigned = (paper as any).assignedTeachers?.some((t: any) => t.id === user?.id);
                const subjectObj = paper.subject as any;
                const isSubjectAssigned = Boolean(
                  (paper.subjectId && mySubjectIds.has(paper.subjectId)) ||
                  (subjectObj?.id && mySubjectIds.has(subjectObj.id)) ||
                  subjectObj?.teacherId === user?.id ||
                  subjectObj?.teacherSubjects?.some((ts: any) => ts.teacherId === user?.id || ts.teacher?.id === user?.id)
                );

                const canAccess = isAdmin || isExamCreator || (isTeacher && (isPaperCreator || isDirectlyAssigned || isSubjectAssigned));
                const isPublishedPaper = paper.status === "PUBLISHED";

                const statusStyle = isPublishedPaper
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800";

                return (
                  <div
                    key={paper.id}
                    onClick={() => {
                      if (canAccess) {
                        router.push(`/dashboard/teacher/exams&quizzes/papers/${paper.id}`);
                      } else {
                        toast.info("Only teachers assigned to this subject, paper creator, or admins can manage this paper.");
                      }
                    }}
                    className={`group relative bg-white dark:bg-slate-900 border rounded-3xl p-4 sm:p-6 transition-all ${
                      canAccess
                        ? "border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-900/5 cursor-pointer"
                        : "border-slate-200 dark:border-slate-800 opacity-70 cursor-not-allowed"
                    }`}
                  >
                    {/* Left accent stripe */}
                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-full ${isPublishedPaper ? "bg-emerald-400" : "bg-amber-400"}`} />

                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pl-2 sm:pl-3">
                      {/* Left Block: Icon & Number Badge */}
                      <div className="flex items-center gap-2.5 sm:block flex-shrink-0">
                        <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center transition-colors ${
                          canAccess
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                          <FileText size={22} />
                        </div>
                        <span className="sm:hidden font-mono text-xs font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="hidden sm:inline font-mono text-xs font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg flex-shrink-0">
                                #{String(idx + 1).padStart(2, '0')}
                              </span>
                              <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {paper.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${statusStyle}`}>
                                {isPublishedPaper ? <Check size={9} /> : null}
                                {paper.status}
                              </span>
                              {paper.subject?.name && (
                                <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {paper.subject.name}
                                </span>
                              )}
                              {isPaperCreator && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  <User size={9} /> Creator
                                </span>
                              )}
                              {!isPaperCreator && isSubjectAssigned && (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  <BookOpen size={9} /> Your Subject
                                </span>
                              )}
                              {!canAccess && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  <Lock size={9} /> Locked
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                            {canAccess && (
                              <Link
                                href={`/dashboard/teacher/exams&quizzes/papers/${paper.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700/60 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                                  title="Edit Subject Paper"
                                >
                                  <Edit size={14} className="stroke-[2.5]" />
                                  <span>Edit</span>
                                </Button>
                              </Link>
                            )}
                            {canAccess && isPublishedPaper && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl cursor-pointer"
                                title="Unpublish Paper"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirmDialog({
                                    title: "Unpublish Paper",
                                    description: `Unpublish "${paper.title}"? It will move back to draft.`,
                                    variant: "warning",
                                    confirmText: "Unpublish",
                                    onConfirm: () => unpublishPaperMutation.mutate(paper.id),
                                  });
                                }}
                              >
                                {unpublishPaperMutation.isPending && unpublishPaperMutation.variables === paper.id ? (
                                  <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                  <Unlock size={16} />
                                )}
                              </Button>
                            )}
                            {canAccess && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer"
                                title="Unlink Paper"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirmDialog({
                                    title: "Unlink Paper",
                                    description: `Remove "${paper.title}" from this exam?`,
                                    variant: "warning",
                                    confirmText: "Unlink Paper",
                                    onConfirm: () => unlinkPaperMutation.mutate(paper.id),
                                  });
                                }}
                              >
                                {unlinkPaperMutation.isPending && unlinkPaperMutation.variables === paper.id ? (
                                  <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                  <Link2Off size={16} />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-primary/60" />
                            {paper.durationMinutes} min
                          </div>
                          {paper.totalMarks != null && (
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck size={12} className="text-indigo-400" />
                              {paper.totalMarks} marks
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-blue-400" />
                            {isPaperCreator
                              ? "You (Creator)"
                              : isSubjectAssigned
                              ? "You (Subject Teacher)"
                              : (paper.teacher?.name || (paper.teacherId ? "Assigned Teacher" : "Unassigned"))}
                          </div>
                          <div className="sm:ml-auto text-slate-400 dark:text-slate-500 font-medium text-[11px]">
                            Updated {format(new Date((paper as any).updatedAt), "MMM d")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PARTICIPANTS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 md:px-8 pb-12 max-w-[1600px] mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                  Exam Participants
                  {attempts.length > 0 && <span className="text-primary ml-1.5">({attempts.length})</span>}
                </h2>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Students who have started or submitted this examination</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              {/* View Mode Toggle: Table vs Grid */}
              {attempts.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setParticipantsViewMode('table')}
                    className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all ${
                      participantsViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title="Table View"
                  >
                    <List size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipantsViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all ${
                      participantsViewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={16} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              <button
                onClick={() => openConfirmDialog({
                  title: exam?.allowImmediateResult ? "Hide Grades" : "Publish Grades",
                  description: exam?.allowImmediateResult ? "Students will no longer see their results." : "All students will immediately see their results.",
                  variant: "warning",
                  confirmText: exam?.allowImmediateResult ? "Hide Grades" : "Publish Grades",
                  onConfirm: () => updateExamMutation.mutate({ allowImmediateResult: !exam?.allowImmediateResult })
                })}
                disabled={updateExamMutation.isPending}
                className={`flex items-center gap-2 border font-bold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm ${exam?.allowImmediateResult ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"}`}
              >
                {exam?.allowImmediateResult ? <Lock size={15} /> : <Unlock size={15} />}
                {exam?.allowImmediateResult ? "Hide Grades" : "Publish Grades"}
              </button>
            </div>
          </div>

          {isLoadingAttempts ? (
            <div className="p-6 sm:p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center px-4">
              <div className="h-14 w-14 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                <Users size={28} />
              </div>
              <p className="font-bold text-slate-500">No students have attempted this exam yet.</p>
            </div>
          ) : participantsViewMode === 'grid' ? (
            /* ── PARTICIPANTS GRID VIEW (Default on Mobile) ── */
            <div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedAttempts.map((attempt: any) => {
                  const scorePercent = attempt.totalMarks > 0 ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : 0;
                  const initials = (attempt.student?.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                  const statusMap: Record<string, string> = {
                    SCORED:      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
                    SUBMITTED:   "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
                    EXPIRED:     "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800",
                    IN_PROGRESS: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
                  };
                  const statusCls = statusMap[attempt.status] || statusMap.IN_PROGRESS;
                  const papersCompleted = (attempt.subjectExamAttempts || attempt.subjectAttempts)?.length || 0;
                  const papersProgressPercent = papers.length > 0 ? Math.round((papersCompleted / papers.length) * 100) : 0;

                  return (
                    <div
                      key={attempt.id}
                      className="relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Student Info & Status */}
                        <div className="flex items-start justify-between gap-2.5 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {attempt.student?.name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                                {attempt.student?.studentCode}
                              </p>
                            </div>
                          </div>

                          <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex-shrink-0 ${statusCls}`}>
                            {attempt.status}
                          </span>
                        </div>

                        {/* Grade Status Pill */}
                        <div className="flex flex-wrap items-center gap-2 mb-3.5">
                          {attempt.grades && attempt.grades.length > 0 ? (
                            <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              attempt.grades[0].status === 'PUBLISHED' 
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}>
                              {attempt.grades[0].status === 'PUBLISHED' ? "Grade Approved" : "Unapproved Grade"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-2.5 py-0.5 rounded-full">
                              No Grade
                            </span>
                          )}
                        </div>

                        {/* Metrics Block: Score & Papers */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-3">
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-lg font-black text-primary">{attempt.totalScore}</span>
                              <span className="text-xs font-bold text-slate-400">/{attempt.totalMarks}</span>
                              <span className="text-[10px] font-bold text-slate-400 ml-0.5">({scorePercent}%)</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Papers</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1">
                              {papersCompleted}/{papers.length} Completed
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>Exam Progress</span>
                            <span>{papersProgressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70 transition-all duration-300"
                              style={{ width: `${papersProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog({
                            title: "Clear Student Record",
                            description: `Delete ${attempt.student?.name}'s attempt? This removes their answers and lets them retake.`,
                            variant: "danger",
                            confirmText: "Clear & Reset",
                            onConfirm: () => deleteAttemptMutation.mutate(attempt.studentId)
                          })}
                          className="h-8 px-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <Trash2 size={13} />
                          <span>Clear Record</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalAttemptsPages > 1 && (
                <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setAttemptsPage(prev => Math.max(prev - 1, 1))} disabled={attemptsPage === 1} className="rounded-xl font-bold h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">Previous</Button>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">Page {attemptsPage} of {totalAttemptsPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setAttemptsPage(prev => Math.min(prev + 1, totalAttemptsPages))} disabled={attemptsPage === totalAttemptsPages} className="rounded-xl font-bold h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">Next</Button>
                </div>
              )}
            </div>
          ) : (
            /* ── PARTICIPANTS TABLE VIEW ── */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Grade Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginatedAttempts.map((attempt: any) => {
                    const scorePercent = attempt.totalMarks > 0 ? Math.round((attempt.totalScore / attempt.totalMarks) * 100) : 0;
                    const initials = (attempt.student?.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase();
                    const statusMap: Record<string, string> = {
                      SCORED:    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
                      SUBMITTED: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
                      EXPIRED:   "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800",
                      IN_PROGRESS: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
                    };
                    const statusCls = statusMap[attempt.status] || statusMap.IN_PROGRESS;

                    return (
                      <tr key={attempt.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{attempt.student?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{attempt.student?.studentCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${statusCls}`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          {attempt.grades && attempt.grades.length > 0 ? (
                            <span className={`inline-flex items-center gap-1 border text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              attempt.grades[0].status === 'PUBLISHED' 
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}>
                              {attempt.grades[0].status === 'PUBLISHED' ? "Approved" : "Unapproved"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">No Grade</span>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/60 transition-all"
                                style={{ width: `${papers.length > 0 ? Math.round(((attempt.subjectExamAttempts || attempt.subjectAttempts)?.length || 0) / papers.length * 100) : 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                              {(attempt.subjectExamAttempts || attempt.subjectAttempts)?.length || 0}/{papers.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-primary">{attempt.totalScore}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-bold text-slate-400">{attempt.totalMarks}</span>
                            <span className="text-[10px] font-bold text-slate-400">({scorePercent}%)</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-3.5 sm:py-4 text-right">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => openConfirmDialog({
                              title: "Clear Student Record",
                              description: `Delete ${attempt.student?.name}'s attempt? This removes their answers and lets them retake.`,
                              variant: "danger",
                              confirmText: "Clear & Reset",
                              onConfirm: () => deleteAttemptMutation.mutate(attempt.studentId)
                            })}
                            className="h-8 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs flex items-center gap-1.5 ml-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 size={13} /> Clear
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalAttemptsPages > 1 && (
                <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setAttemptsPage(prev => Math.max(prev - 1, 1))} disabled={attemptsPage === 1} className="rounded-xl font-bold h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">Previous</Button>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">Page {attemptsPage} of {totalAttemptsPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setAttemptsPage(prev => Math.min(prev + 1, totalAttemptsPages))} disabled={attemptsPage === totalAttemptsPages} className="rounded-xl font-bold h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">Next</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={
          publishExamMutation.isPending ||
          unpublishExamMutation.isPending ||
          deleteExamMutation.isPending ||
          unpublishPaperMutation.isPending ||
          unlinkPaperMutation.isPending ||
          deleteAttemptMutation.isPending ||
          updateExamMutation.isPending
        }
      />
    </div>
  );
}
