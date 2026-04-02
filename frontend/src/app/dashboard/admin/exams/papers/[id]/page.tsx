"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { examService } from "@/lib/api/services/examService";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolDashboardSummary } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FileText, Settings, Loader2, Check, Globe, BookOpen, Eye, Settings as SettingsIcon } from "lucide-react";
import { toast } from "react-toastify";
import QuestionManager from "../../[examId]/papers/[paperId]/components/QuestionManager";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import ReadingContentModal from "../../[examId]/papers/[paperId]/components/ReadingContentModal";
import PaperPreviewModal from "../../[examId]/papers/[paperId]/components/PaperPreviewModal";
import EditPaperModal from "../../[examId]/papers/[paperId]/components/EditPaperModal";
import React, { useState, useMemo, useEffect } from "react";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { PDFDownloadLink } from '@react-pdf/renderer';
import SubjectPaperReport from './components/SubjectPaperReport';

export default function StandalonePaperDetailPage() {
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

  const paper = paperData as any;
  const [isMounted, setIsMounted] = useState(false);

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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Publish failed");
    }
  });

  const unpublishPaperMutation = useMutation({
    mutationFn: () => examService.unpublishPaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Subject paper unpublished!");
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
      router.push(`/dashboard/admin/exams?tab=papers`);
      toast.success("Subject paper deleted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete paper");
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
  const paperSchoolId = paper?.schoolId;
  const fallbackSchoolId = (user as any)?.schools?.[0]?.schoolId || (user as any)?.defaultTenantId || "";
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
  const isAssignedTeacher = paper?.teacherId === user?.id;
  const canAccess = isAdmin || (isTeacher && isAssignedTeacher);

  if (isLoadingPaper) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
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
        <p className="text-gray-500 mb-6">You do not have permission to manage this subject paper.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950/30">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 truncate">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Standalone Paper</span>
                <span className="text-gray-300 dark:text-gray-700">/</span>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate">
                  {paper.title}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {paper.status === "PUBLISHED" ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20 items-center gap-1.5 shadow-sm">
                  <Check size={12} /> Published
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50 text-xs px-3 font-semibold"
                  onClick={() => openConfirmDialog({
                    title: "Unpublish Paper",
                    description: `Move "${paper.title}" back to draft?`,
                    variant: "warning",
                    confirmText: "Unpublish",
                    onConfirm: () => unpublishPaperMutation.mutate()
                  })}
                  disabled={unpublishPaperMutation.isPending}
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
              className="h-8 rounded-lg text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 font-semibold"
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

            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 text-xs px-4 font-bold flex items-center gap-2"
              onClick={() => setIsReadingModalOpen(true)}
            >
              <BookOpen size={12} />
              {paper.readingContent ? "Edit Reading Content" : "Add Reading Content"}
            </Button>

            <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg text-slate-600 border-slate-200 hover:bg-slate-50 text-xs px-3 font-semibold flex items-center gap-1.5"
                onClick={() => setIsEditModalOpen(true)}
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
            
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block mx-1"></div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-gray-900 dark:text-white leading-none">
                {paper.totalMarks} Marks
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                {paper.durationMinutes} Minutes
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-8 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl w-full max-w-md">
            <TabsTrigger value="questions" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2.5 font-bold transition-all">
              Questions
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2.5 font-bold transition-all">
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
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Grades</h2>
                  <p className="text-sm text-gray-500">Performance report for students who took this paper</p>
                </div>

                {isMounted && paper?.examAttempts && paper.examAttempts.length > 0 ? (
                  <PDFDownloadLink
                    document={<SubjectPaperReport paper={paper} school={school} attempts={paper.examAttempts} />}
                    fileName={`${paper.title?.replace(/\s+/g, '_') || 'Report'}_Grade_Report.pdf`}
                  >
                    {({ loading }: any) => (
                      <Button 
                        className="text-white font-bold px-6 rounded-xl shadow-lg transition-all gap-2"
                        disabled={loading}
                        style={{ 
                          backgroundColor: paper.school?.settings?.themeColor || 'var(--primary)',
                          boxShadow: paper.school?.settings?.themeColor ? `0 10px 15px -3px ${paper.school.settings.themeColor}33` : undefined
                        }}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={18} />}
                        {loading ? 'Preparing Download...' : 'Download Grade Report'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : !isMounted && paper?.examAttempts && paper.examAttempts.length > 0 ? (
                   <Button 
                    className="text-white font-bold px-6 rounded-xl shadow-lg transition-all gap-2 opacity-50"
                    disabled
                    style={{ 
                      backgroundColor: paper?.school?.settings?.themeColor || 'var(--primary)',
                    }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing Report...
                  </Button>
                ) : (
                  <Button 
                    className="bg-gray-200 text-gray-400 font-bold px-6 rounded-xl cursor-not-allowed border border-gray-300"
                    disabled
                    title="No attempts recorded"
                  >
                    <FileText size={18} />
                    Download Grade Report
                  </Button>
                )}
              </div>

              {paper.examAttempts && paper.examAttempts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Sat", value: paper.examAttempts.length, color: "text-primary" },
                    { 
                      label: "Class Average", 
                      value: (paper.examAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / paper.examAttempts.length).toFixed(1),
                      color: "text-blue-600" 
                    },
                    { 
                      label: "Highest Score", 
                      value: Math.max(...paper.examAttempts.map((a: any) => a.score || 0)).toFixed(1),
                      color: "text-emerald-600" 
                    },
                    { 
                      label: "Lowest Score", 
                      value: Math.min(...paper.examAttempts.map((a: any) => a.score || 0)).toFixed(1),
                      color: "text-rose-600" 
                    }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Percentage</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {paper.examAttempts && paper.examAttempts.length > 0 ? (
                        paper.examAttempts.map((attempt: any) => {
                          const percentage = (attempt.score / (attempt.totalMarks || paper.totalMarks)) * 100;
                          const isPass = percentage >= (paper.passMark || 40);
                          return (
                            <tr key={attempt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 dark:text-white capitalize">
                                  {attempt.examAttempt?.student?.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-500 font-mono text-xs">
                                {attempt.examAttempt?.student?.studentCode}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-black text-gray-900 dark:text-white">
                                  {attempt.score}
                                </span>
                                <span className="text-gray-400 ml-1">
                                  / {attempt.totalMarks || paper.totalMarks}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                  isPass 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                    : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                }`}>
                                  {isPass ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            No student attempts found for this paper.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
        subjects={subjects}
        teachers={teachers}
        isLoadingData={isLoadingSubjects || isLoadingTeachers}
      />
    </div>
  );
}
