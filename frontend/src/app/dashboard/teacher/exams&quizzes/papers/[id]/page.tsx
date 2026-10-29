"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, FileText, Loader2, Check, Globe, BookOpen, Eye, Settings as SettingsIcon, Trash2, Edit2, Save, X, Info, List, LayoutGrid, Users, Clock, GraduationCap, Download, FileSpreadsheet, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import QuestionManager from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/QuestionManager";
import ConfirmationModal from "@/app/dashboard/admin/exams/components/ui/ConfirmationModal";
import ReadingContentModal from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/ReadingContentModal";
import PaperPreviewModal from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/PaperPreviewModal";
import EditPaperModal from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/EditPaperModal";
import React, { useState, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { computeGradePill } from "@/utils/gradingSystem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generatePDF } from "@/utils/pdfGenerator";
import { cn } from "@/lib/utils";

export interface Paper {
  id: string;
  title: string;
  status: string;
  schoolId: string;
  teacherId?: string;
  createdAt: string | Date;
  totalMarks: number;
  durationMinutes: number;
  passMark?: number;
  readingContent?: string;
  subject?: {
    name: string;
  };
  teacher?: {
    name: string;
  };
  school?: {
    name: string;
    logo?: string;
    settings?: {
      themeColor?: string;
    };
  };
  examAttempts?: any[];
  grades?: any[];
  exams?: any[];
  images?: string[];
  imageLabels?: string[];
  questions?: any[];
}

export default function TeacherPaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const paperId = params.id as string;
  const examId = "none";

  const { data: paperData, isLoading: isLoadingPaper, isError: isErrorPaper } = useQuery({
    queryKey: ["paper", paperId],
    queryFn: () => examService.getPaperById(examId, paperId),
    enabled: !!paperId,
  });

  const paper = paperData as Paper;
  const [isMounted, setIsMounted] = useState(false);
  
  // Grades Tab State
  const [gradesPage, setGradesPage] = useState(1);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>("");
  const [selectedGradeDetail, setSelectedGradeDetail] = useState<any | null>(null);

  const [gradesViewMode, setGradesViewMode] = useState<'table' | 'grid'>('grid');

  useEffect(() => {
    setIsMounted(true);
    const updateViewMode = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          setGradesViewMode('grid');
        } else {
          setGradesViewMode('table');
        }
      }
    };
    updateViewMode();
    window.addEventListener('resize', updateViewMode);
    return () => window.removeEventListener('resize', updateViewMode);
  }, []);

  const queryClient = useQueryClient();

  const publishPaperMutation = useMutation({
    mutationFn: () => examService.publishPaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Subject paper published successfully!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Publish failed");
    }
  });

  const unpublishPaperMutation = useMutation({
    mutationFn: () => examService.unpublishPaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Subject paper unpublished!");
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  });

  const deletePaperMutation = useMutation({
    mutationFn: () => examService.deletePaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      router.push(`/dashboard/teacher/exams&quizzes`);
      toast.success("Subject paper deleted!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete paper");
    }
  });

  const deleteGradeMutation = useMutation({
    mutationFn: (gradeId: string) => apiClient.delete(`/grades/${gradeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Manual grade deleted!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete grade");
    }
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ gradeId, score }: { gradeId: string; score: number }) => 
      apiClient.patch(`/grades/${gradeId}`, { score, status: "PUBLISHED", remarks: "MANUAL_OVERRIDE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Grade updated successfully!");
      setEditingGradeId(null);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update grade");
    }
  });

  const paperSchoolId = paper?.schoolId;
  const userTyped = user as any;
  const fallbackSchoolId = userTyped?.schools?.[0]?.schoolId || userTyped?.tenantId || "";
  const { data: schoolProfile } = useSchoolProfile(paperSchoolId || fallbackSchoolId);

  const createOverrideGradeMutation = useMutation({
    mutationFn: (data: { studentId: string; score: number; maxMarks: number; examAttemptId?: string; subjectExamAttemptId?: string }) => 
      apiClient.post("/grades", {
        studentId: data.studentId,
        ...(examId !== "none" && { examId }),
        subjectPaperId: paperId,
        score: data.score,
        maxMarks: data.maxMarks,
        examAttemptId: data.examAttemptId,
        subjectExamAttemptId: data.subjectExamAttemptId,
        schoolId: paperSchoolId || fallbackSchoolId,
        status: "PUBLISHED",
        remarks: "MANUAL_OVERRIDE",
        subject: paper?.subject?.name || "Unknown",
        category: "EXAM",
        assessmentType: "EXAM"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Grade manually overridden!");
      setEditingGradeId(null);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to override grade");
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

  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch subjects and teachers for the edit modal
  const { data: school } = useSchoolProfile(paperSchoolId || fallbackSchoolId);
  
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects", paperSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${paperSchoolId}`);
      return data.data || data;
    },
    enabled: !!paperSchoolId && isEditModalOpen,
  });

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers", paperSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${paperSchoolId}/teachers`);
      return data.data || data;
    },
    enabled: !!paperSchoolId && isEditModalOpen,
  });

  const isTeacher = user?.userType === "TEACHER";
  const isAdmin = user?.userType === "ADMIN";
  // The backend API strictly guards access to the paper. If the paper successfully loaded, 
  // the user has permission to view/manage it based on their assigned subjects and classes.
  const canAccess = true; 

  const linkedExams = paper?.exams?.filter((e: any) => e.exam?.category === 'EXAM') || [];
  const isLinkedToExam = linkedExams.length > 0;
  const isMainExamPublished = isLinkedToExam && linkedExams.some((e: any) =>
    e.exam?.status === "PUBLISHED" || e.exam?.status === "ONGOING" || e.exam?.status === "COMPLETED"
  );

  // Single-paper types (e.g. CA, QUIZ, ASSIGNMENT, or single subject exams)
  const SINGLE_PAPER_TYPES = ['QUIZ', 'CA', 'ASSIGNMENT'];
  const mainExam = paper?.exams?.[0]?.exam || null;
  const isSinglePaperType = !!(
    (paper as any)?.category && SINGLE_PAPER_TYPES.includes((paper as any).category)
  ) || !!(
    mainExam && (
      SINGLE_PAPER_TYPES.includes((mainExam as any).category || (mainExam as any).type || '') ||
      (mainExam as any).mode === 'SINGLE_SUBJECT'
    )
  );

  const effectiveSchoolId = paperSchoolId || fallbackSchoolId;

  // Fetch Classes for the selector
  const { data: classesData = [] } = useQuery({
    queryKey: ["school-classes", effectiveSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${effectiveSchoolId}`);
      return data.data || [];
    },
    enabled: !!effectiveSchoolId && isEditModalOpen,
  });

  // Fetch Departments for the selector
  const { data: departmentsData = [] } = useQuery({
    queryKey: ["school-departments", effectiveSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/departments?schoolId=${effectiveSchoolId}`);
      return data.data || [];
    },
    enabled: !!effectiveSchoolId && isEditModalOpen,
  });

  // Fetch Sessions for the selector
  const { data: sessionsData = [] } = useQuery({
    queryKey: ["school-sessions", effectiveSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/sessions?schoolId=${effectiveSchoolId}`);
      return data.data || [];
    },
    enabled: !!effectiveSchoolId && isEditModalOpen,
  });

  // Normalize and merge results from online attempts and manual grades
  const onlineResults = useMemo(() => (paper?.examAttempts || []).map((a: any) => ({
    id: a.id,
    studentId: a.studentId || a.examAttempt?.studentId || a.examAttempt?.student?.id,
    studentName: a.examAttempt?.student?.name,
    studentCode: a.examAttempt?.student?.studentCode,
    score: (a.score as number) || 0,
    maxMarks: a.totalMarks || paper?.totalMarks,
    type: 'ONLINE',
    examAttemptId: a.examAttemptId,
    subjectExamAttemptId: a.id
  })), [paper?.examAttempts, paper?.totalMarks]);

  const gradesResults = useMemo(() => (paper?.grades || []).map((g: any) => ({
    id: g.id,
    studentId: g.studentId || g.student?.id,
    studentName: g.student?.name,
    studentCode: g.student?.studentCode,
    score: (g.score as number) || 0,
    maxMarks: g.maxMarks || paper?.totalMarks,
    type: (g.examAttemptId && g.remarks !== 'MANUAL_OVERRIDE') ? 'ONLINE' : 'MANUAL',
    examAttemptId: g.examAttemptId,
    gradeId: g.id,
    overriderName: g.overriderName || g.teacher?.name || null,
  })), [paper?.grades, paper?.totalMarks]);

  const allResults = useMemo(() => {
    const allResultsMap = new Map();
    onlineResults.forEach((r: any) => {
      if (r.studentCode || r.studentName) {
        allResultsMap.set(r.studentCode || r.studentName, r);
      }
    });
    gradesResults.forEach((r: any) => {
      if (r.studentCode || r.studentName) {
        allResultsMap.set(r.studentCode || r.studentName, r);
      }
    });
    return Array.from(allResultsMap.values());
  }, [onlineResults, gradesResults]);

  const hasResults = allResults.length > 0;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(allResults.length / itemsPerPage);
  const paginatedResults = useMemo(() => 
    allResults.slice((gradesPage - 1) * itemsPerPage, gradesPage * itemsPerPage),
    [allResults, gradesPage, itemsPerPage]
  );

  // Statistics
  const avgScore = useMemo(() => 
    hasResults 
      ? (allResults.reduce((sum: number, r: any) => sum + (r.score as number), 0) / allResults.length).toFixed(1)
      : '0.0',
    [hasResults, allResults]
  );
  const highBox = useMemo(() => 
    hasResults ? Math.max(...allResults.map((r: any) => r.score as number)).toFixed(1) : '0.0',
    [hasResults, allResults]
  );
  const lowBox = useMemo(() => 
    hasResults ? Math.min(...allResults.map((r: any) => r.score as number)).toFixed(1) : '0.0',
    [hasResults, allResults]
  );

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!hasResults) {
      toast.warning("No student grades found to export.");
      return;
    }
    setIsExporting(true);
    const toastId = toast.loading("Generating Paper Results PDF...", { autoClose: false });

    try {
      const profileForExport = schoolProfile || paper?.school || {
        name: userTyped?.schools?.[0]?.name || userTyped?.schools?.[0]?.schoolName || 'School',
        schoolLogo: schoolProfile?.logo || schoolProfile?.schoolLogo || '/schoolhub.png',
        address: schoolProfile?.address || ''
      };

      const metaData = [
        { label: 'Paper Title', value: paper?.title || 'Subject Paper' },
        { label: 'Academic Subject', value: paper?.subject?.name || '-' },
        { label: 'Assigned Teacher', value: paper?.teacher?.name || user?.name || '-' },
        { label: 'Total Mark Scale', value: `${paper?.totalMarks || 100} Marks` },
        { label: 'Pass Mark Standard', value: `${paper?.passMark || 50}%` },
        { label: 'Duration Allocation', value: `${paper?.durationMinutes || 0} Minutes` },
        { label: 'Total Candidates', value: `${allResults.length} Enrolled` },
        { label: 'Average Score', value: `${avgScore} / ${paper?.totalMarks || 100}` },
        { label: 'Highest Mark', value: `${highBox} / ${paper?.totalMarks || 100}` },
        { label: 'Lowest Mark', value: `${lowBox} / ${paper?.totalMarks || 100}` },
      ];

      const tableData = allResults.map((r: any, idx: number) => {
        const pct = ((r.score / r.maxMarks) * 100);
        const isPass = pct >= (paper?.passMark || 50);
        return [
          String(idx + 1),
          r.studentName || 'Unknown Student',
          r.studentCode || 'No Code',
          String(r.score),
          String(r.maxMarks),
          `${pct.toFixed(1)}%`,
          isPass ? 'PASSED' : 'FAILED',
          r.type === 'MANUAL' ? (r.examAttemptId ? 'OVERRIDE' : 'MANUAL') : 'ONLINE'
        ];
      });

      const safeTitle = (paper?.title || 'Subject_Paper').replace(/[^a-zA-Z0-9]/g, '_');
      await generatePDF({
        title: `${paper?.title || 'Subject Paper'} - Performance Report`,
        filename: `${safeTitle}_Grades_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        schoolProfile: profileForExport,
        metaData,
        tableHeaders: [['#', 'Student Name', 'Student ID', 'Score', 'Max', '%', 'Result', 'Type']],
        tableData,
        orientation: 'landscape'
      });

      toast.update(toastId, { render: "PDF Exported Successfully!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.update(toastId, { render: "Failed to generate PDF", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!hasResults) {
      toast.warning("No student grades found to export.");
      return;
    }

    const profileForExport = schoolProfile || paper?.school || {
      name: userTyped?.schools?.[0]?.name || userTyped?.schools?.[0]?.schoolName || 'School',
      address: schoolProfile?.address || ''
    };

    const schoolName = profileForExport.name || 'School';
    const schoolAddress = profileForExport.address || '';
    const headers = ['S/N', 'Student Name', 'Student ID', 'Score', 'Max Marks', 'Percentage (%)', 'Standard Result', 'Entry Type', 'Evaluator'];

    const rows = allResults.map((r: any, idx: number) => {
      const pct = ((r.score / r.maxMarks) * 100);
      const isPass = pct >= (paper?.passMark || 50);
      return [
        idx + 1,
        `"${(r.studentName || 'Unknown Student').replace(/"/g, '""')}"`,
        `"${(r.studentCode || 'No Code').replace(/"/g, '""')}"`,
        `"${r.score}"`,
        `"${r.maxMarks}"`,
        `"${pct.toFixed(1)}%"`,
        `"${isPass ? 'PASSED' : 'FAILED'}"`,
        `"${r.type === 'MANUAL' ? (r.examAttemptId ? 'OVERRIDE' : 'MANUAL') : 'ONLINE'}"`,
        `"${(r.overriderName || 'System Submitted').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [
      `"${schoolName}"`,
      `"${schoolAddress}"`,
      `"Paper Assessment: ${(paper?.title || 'Subject Paper').replace(/"/g, '""')}"`,
      `"Subject: ${(paper?.subject?.name || '-').replace(/"/g, '""')} | Total Marks: ${paper?.totalMarks || 100} | Pass Mark: ${paper?.passMark || 50}%"`,
      `"Average: ${avgScore} | Highest: ${highBox} | Lowest: ${lowBox}"`,
      `"Export Date: ${new Date().toLocaleDateString('en-GB')}"`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const safeTitle = (paper?.title || 'Subject_Paper').replace(/[^a-zA-Z0-9]/g, '_');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${safeTitle}_Grades_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported Successfully!");
  };

  if (isLoadingPaper) {
    return (
      <div className="min-h-screen bg-transparent">
        {/* Skeleton Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="max-w-[106rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Skeleton Main Content */}
        <div className="max-w-[106rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Actions & Metrics */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-40 rounded-xl" />
              <Skeleton className="h-20 w-40 rounded-xl" />
              <Skeleton className="h-20 w-40 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Tabs Area */}
            <div className="xl:col-span-3 space-y-6">
              <Skeleton className="h-14 w-full md:w-96 rounded-xl" />
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
            
            {/* Sidebar Area */}
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isErrorPaper || !paper) {
    return (
      <div className="max-w-[95rem] mx-auto p-6 md:p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Paper Not Found</h2>
        <p className="text-gray-500 mb-6">The subject paper you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="max-w-[95rem] mx-auto p-6 md:p-8 text-center">
        <h2 className="text-xl font-bold text-amber-600 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You do not have permission to manage this subject paper.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {isMainExamPublished && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2 flex items-center justify-center text-center">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2">
                <Info size={14} className="shrink-0" />
                <span>The parent exam is currently active. To make edits, please inform the admin to unpublish the main exam first.</span>
            </p>
        </div>
      )}

      {/* Header Sticky Container */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 sticky top-0 z-30 backdrop-blur-xl">
        {/* Desktop Single-Row Header */}
        <div className="hidden md:flex max-w-[106rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between">
          <div className="flex items-center gap-4 truncate">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Paper Manager</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <h1 className="text-lg font-black text-slate-900 dark:text-white capitalize truncate">
                  {paper.title}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {paper.status === "PUBLISHED" ? (
              <div className="flex items-center gap-2">
                <div className="flex bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20 items-center gap-1.5 shadow-sm">
                  <Check size={12} /> Published
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50 text-xs px-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => openConfirmDialog({
                    title: "Unpublish Paper",
                    description: `Move "${paper.title}" back to draft?`,
                    variant: "warning",
                    confirmText: "Unpublish",
                    onConfirm: () => unpublishPaperMutation.mutate()
                  })}
                  disabled={unpublishPaperMutation.isPending || isMainExamPublished}
                  title={isMainExamPublished ? "Cannot unpublish because the parent exam is published." : ""}
                >
                  {unpublishPaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : null}
                  Unpublish
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-none px-4 text-xs font-bold"
                onClick={() => publishPaperMutation.mutate()}
                disabled={publishPaperMutation.isPending}
              >
                {publishPaperMutation.isPending ? (
                  <Loader2 className="animate-spin h-3 w-3 mr-1.5" />
                ) : (
                  <Globe size={12} className="mr-1.5" />
                )}
                Publish
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => openConfirmDialog({
                title: "Delete Paper",
                description: `Permanently delete "${paper.title}"?`,
                variant: "danger",
                confirmText: "Delete",
                onConfirm: () => deletePaperMutation.mutate()
              })}
              disabled={deletePaperMutation.isPending || isMainExamPublished}
              title={isMainExamPublished ? "Cannot delete because the parent exam is published." : ""}
            >
              {deletePaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : null}
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 text-xs px-4 font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsReadingModalOpen(true)}
              disabled={isMainExamPublished}
              title={isMainExamPublished ? "Cannot edit because the parent exam is published." : ""}
            >
              <BookOpen size={12} />
              {paper.readingContent ? "Edit Reading Content" : "Add Reading Content"}
            </Button>

            <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg text-slate-600 border-slate-200 hover:bg-slate-50 text-xs px-3 font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsEditModalOpen(true)}
                disabled={isMainExamPublished}
                title={isMainExamPublished ? "Cannot edit settings because the parent exam is published." : ""}
            >
                <SettingsIcon size={14} /> Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg bg-amber-500/5 text-amber-600 border-amber-200 hover:bg-amber-100 text-xs px-4 font-bold flex items-center gap-2"
              onClick={() => setIsPreviewModalOpen(true)}
            >
              <Eye size={12} />
              Preview Mode
            </Button>
      
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                {paper.totalMarks} Marks
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                {paper.durationMinutes} Minutes
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Header: 2 Clean Rows */}
        <div className="md:hidden px-3.5 py-2.5 flex flex-col gap-2">
          {/* Top Row: Back button, Title, Status & Quick Metrics */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 -ml-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-slate-900 dark:text-white capitalize truncate">
                    {paper.title}
                  </h1>
                  {paper.status === "PUBLISHED" ? (
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-black border border-emerald-200/50 shrink-0">
                      LIVE
                    </span>
                  ) : (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">
                      DRAFT
                    </span>
                  )}
                </div>
                {paper.subject?.name && (
                  <p className="text-[10px] font-bold text-slate-400 truncate">
                    {paper.subject.name}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {paper.totalMarks}M
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {paper.durationMinutes}m
              </span>
            </div>
          </div>

          {/* Bottom Row: Horizontally scrollable action pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
            {paper.status === "PUBLISHED" ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50 text-[11px] px-2.5 font-bold shrink-0 disabled:opacity-50"
                onClick={() => openConfirmDialog({
                  title: "Unpublish Paper",
                  description: `Move "${paper.title}" back to draft?`,
                  variant: "warning",
                  confirmText: "Unpublish",
                  onConfirm: () => unpublishPaperMutation.mutate()
                })}
                disabled={unpublishPaperMutation.isPending || isMainExamPublished}
              >
                {unpublishPaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : null}
                Unpublish
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-3 font-bold shrink-0 gap-1"
                onClick={() => publishPaperMutation.mutate()}
                disabled={publishPaperMutation.isPending}
              >
                {publishPaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Globe size={11} />}
                Publish
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 hover:bg-amber-100 text-[11px] px-2.5 font-bold shrink-0 gap-1"
              onClick={() => setIsPreviewModalOpen(true)}
            >
              <Eye size={11} />
              Preview
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 rounded-lg text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] px-2.5 font-bold shrink-0 gap-1 disabled:opacity-50"
              onClick={() => setIsEditModalOpen(true)}
              disabled={isMainExamPublished}
            >
              <SettingsIcon size={12} />
              Settings
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 text-[11px] px-2.5 font-bold shrink-0 gap-1 disabled:opacity-50"
              onClick={() => setIsReadingModalOpen(true)}
              disabled={isMainExamPublished}
            >
              <BookOpen size={11} />
              Reading
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] px-2.5 font-bold shrink-0 gap-1 disabled:opacity-50"
              onClick={() => openConfirmDialog({
                title: "Delete Paper",
                description: `Permanently delete "${paper.title}"?`,
                variant: "danger",
                confirmText: "Delete",
                onConfirm: () => deletePaperMutation.mutate()
              })}
              disabled={deletePaperMutation.isPending || isMainExamPublished}
            >
              {deletePaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Trash2 size={11} />}
              Delete
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-[106rem] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 md:py-8">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-6 md:mb-8 p-1 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl w-full sm:max-w-md border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-2">
            <TabsTrigger 
              value="questions" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2.5 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={15} className="shrink-0" />
                <span>Questions</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-600 text-slate-700 dark:text-slate-200 shrink-0">
                  {paper.questions?.length || 0}
                </span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="grades" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2.5 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <GraduationCap size={15} className="shrink-0" />
                <span>Grades</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-600 text-slate-700 dark:text-slate-200 shrink-0">
                  {allResults.length}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <QuestionManager 
                paperId={paperId} 
                examId={examId}
                paper={paper}
            />
          </TabsContent>

          <TabsContent value="grades">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Student Grades</h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">Performance report for students who took this paper</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* View Mode Switcher */}
                  {hasResults && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setGradesViewMode('table')}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                          gradesViewMode === 'table'
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                        title="Table view"
                      >
                        <List size={14} />
                        <span className="hidden sm:inline">Table</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradesViewMode('grid')}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                          gradesViewMode === 'grid'
                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                        title="Grid view"
                      >
                        <LayoutGrid size={14} />
                        <span className="hidden sm:inline">Grid</span>
                      </button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        disabled={!hasResults || isExporting}
                        className="text-white font-black px-4 sm:px-6 rounded-2xl shadow-lg transition-all gap-2 uppercase tracking-widest text-[10px] h-9 cursor-pointer disabled:opacity-50"
                        style={{ 
                          backgroundColor: paper.school?.settings?.themeColor || 'var(--primary)',
                          boxShadow: paper.school?.settings?.themeColor ? `0 10px 15px -3px ${paper.school.settings.themeColor}33` : undefined
                        }}
                      >
                        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download size={14} />}
                        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                        <ChevronDown size={14} className="opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1.5 z-50">
                      <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer flex items-center gap-2.5 text-xs font-semibold py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <FileText size={15} className="text-rose-500 shrink-0" />
                        <span>Export as PDF</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer flex items-center gap-2.5 text-xs font-semibold py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <FileSpreadsheet size={15} className="text-emerald-500 shrink-0" />
                        <span>Export as CSV</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {hasResults && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: "Total Sat", value: allResults.length, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Class Average", value: avgScore, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Highest Score", value: highBox, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Lowest Score", value: lowBox, color: "text-rose-600" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                      <p className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid Mode View: Always rendered on mobile, and on desktop when gradesViewMode === 'grid' */}
              {hasResults && (
                <div className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4",
                  gradesViewMode === 'grid' ? "grid" : "grid md:hidden"
                )}>
                  {paginatedResults.map((result: any, idx: number) => {
                    const percentage = (result.score / result.maxMarks) * 100;
                    const isPass = percentage >= (paper.passMark || 40);
                    const isEditing = editingGradeId === result.id;
                    const actualIndex = (gradesPage - 1) * itemsPerPage + idx + 1;

                    return (
                      <div 
                        key={result.id}
                        onClick={() => !isEditing && setSelectedGradeDetail(result)}
                        className={cn(
                          "bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between border-l-4",
                          isPass ? "border-l-emerald-500" : "border-l-rose-500"
                        )}
                      >
                        <div>
                          {/* Card Top: Index, Name, Student Code */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                                {String(actualIndex).padStart(2, '0')}
                              </span>
                              <div className="truncate">
                                <h4 className="font-black text-slate-900 dark:text-white capitalize text-sm truncate">
                                  {result.studentName || 'Unknown Student'}
                                </h4>
                                <p className="text-[11px] font-mono font-bold text-slate-400">
                                  {result.studentCode || 'No Code'}
                                </p>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase shrink-0 ${
                              result.type === 'MANUAL' 
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                            }`}>
                              {result.type === 'MANUAL' && result.examAttemptId ? 'OVERRIDE' : result.type}
                            </span>
                          </div>

                          {/* Score & Progress */}
                          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 mb-3 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-baseline justify-between mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                              {isEditing ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="number"
                                    className="w-16 h-7 text-center border border-emerald-300 dark:border-emerald-600 rounded-lg text-sm font-black bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={editScore}
                                    onChange={(e) => setEditScore(e.target.value)}
                                    autoFocus
                                  />
                                  <span className="text-slate-400 text-xs font-bold">/ {result.maxMarks}</span>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="text-lg font-black text-slate-900 dark:text-white">{result.score}</span>
                                  <span className="text-xs font-bold text-slate-400">/ {result.maxMarks}</span>
                                  <span className={`text-xs font-black ${isPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                    ({percentage.toFixed(0)}%)
                                  </span>
                                  {(() => {
                                    const pill = computeGradePill(percentage, school?.gradingSystem);
                                    return (
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${pill.bg} ${pill.color}`} title={pill.remark}>
                                        {pill.label}
                                      </span>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-auto" onClick={(e) => e.stopPropagation()}>
                          <div className="text-[10px] font-bold text-slate-400 truncate max-w-[140px]">
                            {result.overriderName ? `By: ${result.overriderName}` : 'Submitted Online'}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!result.studentId) {
                                      toast.error("Student ID is missing. Cannot override.");
                                      return;
                                    }
                                    if (result.type === 'ONLINE') {
                                      createOverrideGradeMutation.mutate({
                                        studentId: result.studentId,
                                        score: Number(editScore),
                                        maxMarks: result.maxMarks,
                                        examAttemptId: result.examAttemptId,
                                        subjectExamAttemptId: result.subjectExamAttemptId
                                      });
                                    } else {
                                      if (!result.gradeId) {
                                        toast.error("Grade ID is missing.");
                                        return;
                                      }
                                      updateGradeMutation.mutate({ gradeId: result.gradeId, score: Number(editScore) });
                                    }
                                  }}
                                  disabled={updateGradeMutation.isPending || createOverrideGradeMutation.isPending}
                                  className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1"
                                >
                                  {updateGradeMutation.isPending || createOverrideGradeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingGradeId(null);
                                  }}
                                  className="h-7 px-2 rounded-lg text-slate-500 text-xs"
                                >
                                  <X size={12} />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingGradeId(result.id);
                                    setEditScore(result.score.toString());
                                  }}
                                  className="h-7 px-2.5 rounded-lg text-xs font-bold text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 gap-1"
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </Button>

                                {result.type === 'MANUAL' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openConfirmDialog({
                                        title: "Delete Manual Grade",
                                        description: `Are you sure you want to delete the manual grade for ${result.studentName}?`,
                                        variant: "danger",
                                        confirmText: "Delete",
                                        onConfirm: () => {
                                          deleteGradeMutation.mutate(result.gradeId);
                                          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                        }
                                      });
                                    }}
                                    disabled={deleteGradeMutation.isPending}
                                    className="h-7 w-7 p-0 rounded-lg text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    title="Delete manual grade"
                                  >
                                    {deleteGradeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Mode View: shown on desktop (md+) when gradesViewMode === 'table' */}
              {hasResults && gradesViewMode === 'table' && (
                <div className="hidden md:block bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-100/50 dark:bg-emerald-900/30 border-b border-emerald-200/50 dark:border-emerald-800/50">
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Editor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedResults.map((result: any, idx: number) => {
                          const percentage = (result.score / result.maxMarks) * 100;
                          const isPass = percentage >= (paper.passMark || 40);
                          const isEditing = editingGradeId === result.id;
                          const actualIndex = (gradesPage - 1) * itemsPerPage + idx + 1;
                          
                          return (
                            <tr 
                              key={result.id} 
                              className="hover:bg-emerald-100/30 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                              onClick={() => !isEditing && setSelectedGradeDetail(result)}
                            >
                              <td className="px-6 py-4 text-[11px] font-black text-slate-400">
                                {String(actualIndex).padStart(2, '0')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-black text-slate-900 dark:text-white capitalize text-sm">
                                  {result.studentName}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-500 font-mono text-xs">
                                {result.studentCode}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="number"
                                      className="w-16 h-8 text-center border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                      value={editScore}
                                      onChange={(e) => setEditScore(e.target.value)}
                                      autoFocus
                                    />
                                    <span className="text-slate-400 font-bold">/ {result.maxMarks}</span>
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-black text-slate-900 dark:text-white">
                                      {result.score}
                                    </span>
                                    <span className="text-slate-400 ml-1 font-bold">
                                      / {result.maxMarks}
                                    </span>
                                  </>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                                    {percentage.toFixed(0)}%
                                  </span>
                                  {(() => {
                                    const pill = computeGradePill(percentage, school?.gradingSystem);
                                    return (
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${pill.bg} ${pill.color}`} title={pill.remark}>
                                        {pill.label}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                                      result.type === 'MANUAL' 
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    }`}>
                                      {result.type === 'MANUAL' && result.examAttemptId ? 'MANUAL OVERRIDE' : result.type}
                                    </span>
                                  </div>
                                  
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!result.studentId) {
                                            toast.error("Student ID is missing. Cannot override.");
                                            return;
                                          }
                                          if (result.type === 'ONLINE') {
                                            createOverrideGradeMutation.mutate({
                                              studentId: result.studentId,
                                              score: Number(editScore),
                                              maxMarks: result.maxMarks,
                                              examAttemptId: result.examAttemptId,
                                              subjectExamAttemptId: result.subjectExamAttemptId
                                            });
                                          } else {
                                            if (!result.gradeId) {
                                              toast.error("Grade ID is missing.");
                                              return;
                                            }
                                            updateGradeMutation.mutate({ gradeId: result.gradeId, score: Number(editScore) });
                                          }
                                        }}
                                        disabled={updateGradeMutation.isPending || createOverrideGradeMutation.isPending}
                                        className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 p-2 rounded-xl transition-all disabled:opacity-50"
                                        title="Save grade"
                                      >
                                        {updateGradeMutation.isPending || createOverrideGradeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingGradeId(null);
                                        }}
                                        className="text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-xl transition-all"
                                        title="Cancel edit"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingGradeId(result.id);
                                          setEditScore(result.score.toString());
                                        }}
                                        className="text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 p-2 rounded-xl transition-all"
                                        title="Edit / Override score"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      {result.type === 'MANUAL' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openConfirmDialog({
                                              title: "Delete Manual Grade",
                                              description: `Are you sure you want to delete the manual grade for ${result.studentName}?`,
                                              variant: "danger",
                                              confirmText: "Delete",
                                              onConfirm: () => {
                                                deleteGradeMutation.mutate(result.gradeId);
                                                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                              }
                                            });
                                          }}
                                          disabled={deleteGradeMutation.isPending}
                                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 p-2 rounded-xl transition-all disabled:opacity-50"
                                          title="Delete manual grade"
                                        >
                                          {deleteGradeMutation.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                          ) : (
                                            <Trash2 size={16} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Clean Empty State when no results */}
              {!hasResults && (
                <div className="bg-white dark:bg-slate-900/80 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] p-8 sm:p-16 text-center shadow-sm">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No grades recorded yet</h3>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto mt-1">
                    Students who take this paper or have grades manually entered will appear here.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 sm:p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 text-center sm:text-left">
                    Showing {(gradesPage - 1) * itemsPerPage + 1} to {Math.min(gradesPage * itemsPerPage, allResults.length)} of {allResults.length} students
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGradesPage(p => Math.max(1, p - 1))}
                      disabled={gradesPage === 1}
                      className="h-8 rounded-lg text-xs font-bold border-slate-200"
                    >
                      <ChevronLeft size={14} className="mr-1" /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGradesPage(p => Math.min(totalPages, p + 1))}
                      disabled={gradesPage === totalPages}
                      className="h-8 rounded-lg text-xs font-bold border-slate-200"
                    >
                      Next <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
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
        paper={paper as any}
      />

      <EditPaperModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        paper={paper as any}
        exam={mainExam}
        isSinglePaperType={isSinglePaperType}
        subjects={subjects}
        teachers={teachers}
        classes={classesData}
        departments={departmentsData}
        sessions={sessionsData}
        isLoadingData={isLoadingSubjects || isLoadingTeachers}
      />

      <Dialog open={!!selectedGradeDetail} onOpenChange={(open) => !open && setSelectedGradeDetail(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
          <div className="bg-emerald-500 p-6 text-white text-center">
            <DialogTitle className="text-xl font-black mb-1">Grade Details</DialogTitle>
            <p className="text-emerald-100 text-sm font-medium">Detailed view of the student's performance</p>
          </div>
          
          {selectedGradeDetail && (
            <div className="flex flex-col p-6 gap-4">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student</span>
                <span className="text-sm font-black text-slate-800 dark:text-white capitalize">{selectedGradeDetail.studentName}</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Code</span>
                <span className="text-sm font-bold text-slate-500 font-mono">{selectedGradeDetail.studentCode}</span>
              </div>
              
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl">
                <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest">Score</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selectedGradeDetail.score}</span>
                    <span className="text-sm font-bold text-emerald-600/50 dark:text-emerald-400/50">/ {selectedGradeDetail.maxMarks}</span>
                  </div>
                  {(() => {
                    const max = selectedGradeDetail.maxMarks || 100;
                    const pct = max > 0 ? (selectedGradeDetail.score / max) * 100 : 0;
                    const pill = computeGradePill(pct, school?.gradingSystem);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${pill.bg} ${pill.color}`}>
                        <span>{pill.label}</span>
                        {pill.remark && <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">({pill.remark})</span>}
                      </span>
                    );
                  })()}
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submission Type</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                  selectedGradeDetail.type === 'MANUAL' 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                }`}>
                  {selectedGradeDetail.type === 'MANUAL' && selectedGradeDetail.examAttemptId ? 'MANUAL OVERRIDE' : selectedGradeDetail.type}
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editor</span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                  {selectedGradeDetail.overriderName || 'System'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
