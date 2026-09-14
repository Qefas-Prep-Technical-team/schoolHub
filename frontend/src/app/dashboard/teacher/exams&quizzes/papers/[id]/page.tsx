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
import { ChevronLeft, ChevronRight, FileText, Loader2, Check, Globe, BookOpen, Eye, Settings as SettingsIcon, Trash2, Edit2, Save, X, Info } from "lucide-react";
import { toast } from "react-toastify";
import QuestionManager from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/QuestionManager";
import ConfirmationModal from "@/app/dashboard/admin/exams/components/ui/ConfirmationModal";
import ReadingContentModal from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/ReadingContentModal";
import PaperPreviewModal from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/PaperPreviewModal";
import EditPaperModal from "@/app/dashboard/admin/exams/[examId]/papers/[paperId]/components/EditPaperModal";
import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { PDFDownloadLink } from '@react-pdf/renderer';
import SubjectPaperReport from './components/SubjectPaperReport';

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

  useEffect(() => {
    setIsMounted(true);
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

  const linkedExams = paper.exams?.filter((e: any) => e.exam?.category === 'EXAM') || [];
  const isLinkedToExam = linkedExams.length > 0;
  const isMainExamPublished = isLinkedToExam && linkedExams.some((e: any) =>
    e.exam?.status === "PUBLISHED" || e.exam?.status === "ONGOING" || e.exam?.status === "COMPLETED"
  );

  return (
    <div className="min-h-screen bg-transparent">
      {isMainExamPublished && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2 flex items-center justify-center text-center">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2">
                <Info size={14} />
                The parent exam is currently active. To make edits, please inform the admin to unpublish the main exam first.
            </p>
        </div>
      )}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-[106rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <>
                  {paper.status === "PUBLISHED" ? (
                    <div className="flex items-center gap-2">
                      <div className="hidden md:flex bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20 items-center gap-1.5 shadow-sm">
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
                        {unpublishPaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3" /> : "Unpublish"}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 px-4 text-xs font-bold"
                      onClick={() => publishPaperMutation.mutate()}
                      disabled={publishPaperMutation.isPending}
                    >
                      {publishPaperMutation.isPending ? (
                        <Loader2 className="animate-spin h-3 w-3" />
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
                    {deletePaperMutation.isPending ? <Loader2 className="animate-spin h-3 w-3" /> : "Delete"}
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
                </>
            
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
      </div>

      <main className="max-w-[106rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-8 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-[1.25rem] w-full max-w-md border border-slate-200/50 dark:border-slate-800/50">
            <TabsTrigger value="questions" className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2.5 font-black text-xs uppercase tracking-widest transition-all">
              Questions
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2.5 font-black text-xs uppercase tracking-widest transition-all">
              Grades
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
            {(() => {
              // Normalize and merge results from online attempts and manual grades
              const onlineResults = (paper.examAttempts || []).map((a: any) => ({
                id: a.id,
                studentId: a.studentId || a.examAttempt?.studentId || a.examAttempt?.student?.id,
                studentName: a.examAttempt?.student?.name,
                studentCode: a.examAttempt?.student?.studentCode,
                score: a.score as number || 0,
                maxMarks: a.totalMarks || paper.totalMarks,
                type: 'ONLINE',
                examAttemptId: a.examAttemptId,
                subjectExamAttemptId: a.id
              }));

              const gradesResults = (paper.grades || []).map((g: any) => ({
                id: g.id,
                studentId: g.studentId || g.student?.id,
                studentName: g.student?.name,
                studentCode: g.student?.studentCode,
                score: g.score as number || 0,
                maxMarks: g.maxMarks || paper.totalMarks,
                type: (g.examAttemptId && g.remarks !== 'MANUAL_OVERRIDE') ? 'ONLINE' : 'MANUAL',
                examAttemptId: g.examAttemptId,
                gradeId: g.id,
                overriderName: g.overriderName || g.teacher?.name || null,
              }));

              const allResultsMap = new Map();
              
              onlineResults.forEach((r: any) => {
                if (r.studentCode || r.studentName) {
                  allResultsMap.set(r.studentCode || r.studentName, r);
                }
              });

              gradesResults.forEach((r: any) => {
                if (r.studentCode || r.studentName) {
                  // Grades override online attempts if they exist
                  allResultsMap.set(r.studentCode || r.studentName, r);
                }
              });

              const allResults = Array.from(allResultsMap.values());
              const hasResults = allResults.length > 0;
              
              const itemsPerPage = 10;
              const totalPages = Math.ceil(allResults.length / itemsPerPage);
              const paginatedResults = allResults.slice((gradesPage - 1) * itemsPerPage, gradesPage * itemsPerPage);

              // Statistics
              const avgScore = hasResults 
                ? (allResults.reduce((sum, r) => sum + (r.score as number), 0) / allResults.length).toFixed(1)
                : '0.0';
              const highBox = hasResults ? Math.max(...allResults.map(r => r.score as number)).toFixed(1) : '0.0';
              const lowBox = hasResults ? Math.min(...allResults.map(r => r.score as number)).toFixed(1) : '0.0';

              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Student Grades</h2>
                      <p className="text-sm font-semibold text-slate-500">Performance report for students who took this paper</p>
                    </div>

                    {isMounted && hasResults ? (
                      <PDFDownloadLink
                        document={<SubjectPaperReport paper={paper} school={school} attempts={allResults.map(r => ({
                          ...r,
                          totalMarks: r.maxMarks, // Pass totalMarks for compatibility with component
                          examAttempt: { student: { name: r.studentName, studentCode: r.studentCode } }
                        }))} />}
                        fileName={`${paper.title?.replace(/\s+/g, '_') || 'Report'}_Grade_Report.pdf`}
                      >
                        {({ loading }: { loading: boolean }) => (
                          <Button 
                            className="text-white font-black px-6 rounded-2xl shadow-xl transition-all gap-2 uppercase tracking-widest text-[10px]"
                            disabled={loading}
                            style={{ 
                              backgroundColor: paper.school?.settings?.themeColor || 'var(--primary)',
                              boxShadow: paper.school?.settings?.themeColor ? `0 10px 15px -3px ${paper.school.settings.themeColor}33` : undefined
                            }}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={16} />}
                            {loading ? 'Preparing...' : 'Download Grade Report'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <Button 
                        className="bg-slate-200 text-slate-400 font-bold px-6 rounded-2xl cursor-not-allowed border border-slate-300 uppercase tracking-widest text-[10px]"
                        disabled
                        title="No attempts recorded"
                      >
                        <FileText size={16} />
                        Download Grade Report
                      </Button>
                    )}
                  </div>

                  {hasResults && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Total Sat", value: allResults.length, color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Class Average", value: avgScore, color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Highest Score", value: highBox, color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Lowest Score", value: lowBox, color: "text-rose-600" }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-6 rounded-[2rem] shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-emerald-100/50 dark:bg-emerald-900/30 border-b border-emerald-200/50 dark:border-emerald-800/50">
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Editor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {hasResults ? (
                            paginatedResults.map((result: any, idx: number) => {
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
                                  <td className="px-8 py-5 text-[11px] font-black text-slate-400">
                                    {String(actualIndex).padStart(2, '0')}
                                  </td>
                                  <td className="px-8 py-5">
                                    <div className="font-black text-slate-900 dark:text-white capitalize">
                                      {result.studentName}
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 font-bold text-slate-500 font-mono text-xs">
                                    {result.studentCode}
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                    {isEditing ? (
                                      <div className="flex items-center justify-center gap-2">
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
                                  <td className="px-8 py-5">
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
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                      <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
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
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!result.studentId) {
                                                toast.error("Student ID is missing. Cannot override.");
                                                return;
                                              }
                                              if (result.type === 'ONLINE') {
                                                // Create a new manual override grade linked to this attempt
                                                createOverrideGradeMutation.mutate({
                                                  studentId: result.studentId,
                                                  score: Number(editScore),
                                                  maxMarks: result.maxMarks,
                                                  examAttemptId: result.examAttemptId,
                                                  subjectExamAttemptId: result.subjectExamAttemptId
                                                });
                                              } else {
                                                // Update the existing manual grade
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
                                              onClick={() => {
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
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                  <FileText className="opacity-20" size={48} />
                                  <p className="font-extrabold uppercase tracking-widest text-xs">No grades found for this paper.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500">
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
              );
            })()}
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
        subjects={subjects}
        teachers={teachers}
        isLoadingData={isLoadingSubjects || isLoadingTeachers}
      />

      <Dialog open={!!selectedGradeDetail} onOpenChange={(open) => !open && setSelectedGradeDetail(null)}>
        <DialogContent className="sm:max-w-md border-0 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
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
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selectedGradeDetail.score}</span>
                  <span className="text-sm font-bold text-emerald-600/50 dark:text-emerald-400/50">/ {selectedGradeDetail.maxMarks}</span>
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
