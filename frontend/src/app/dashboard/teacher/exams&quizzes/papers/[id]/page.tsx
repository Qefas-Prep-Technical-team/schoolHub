"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FileText, Loader2, Check, Globe, BookOpen, Eye, Settings as SettingsIcon, Trash2 } from "lucide-react";
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
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
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
  const userTyped = user as any;
  const fallbackSchoolId = userTyped?.schools?.[0]?.schoolId || userTyped?.tenantId || "";
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
    <div className="min-h-screen bg-transparent">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 truncate">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/dashboard/teacher/exams&quizzes')}
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
                <div className="hidden md:flex bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20 items-center gap-1.5 shadow-sm">
                  <Check size={12} /> Published
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50 text-xs px-3 font-bold"
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
              className="h-8 rounded-lg text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 font-bold"
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
                className="h-8 rounded-lg text-slate-600 border-slate-200 hover:bg-slate-50 text-xs px-3 font-bold flex items-center gap-1.5"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                studentName: a.examAttempt?.student?.name,
                studentCode: a.examAttempt?.student?.studentCode,
                score: a.score as number || 0,
                maxMarks: a.totalMarks || paper.totalMarks,
                type: 'ONLINE'
              }));

              const manualResults = (paper.grades || [])
                .filter((g: any) => !g.examAttemptId && !g.subjectExamAttemptId)
                .map((g: any) => ({
                id: g.id,
                studentName: g.student?.name,
                studentCode: g.student?.studentCode,
                score: g.score as number || 0,
                maxMarks: g.maxMarks,
                type: 'MANUAL',
                gradeId: g.id
              }));

              const allResults = [...onlineResults, ...manualResults];
              const hasResults = allResults.length > 0;

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
                        { label: "Total Sat", value: allResults.length, color: "text-primary" },
                        { label: "Class Average", value: avgScore, color: "text-blue-600" },
                        { label: "Highest Score", value: highBox, color: "text-emerald-600" },
                        { label: "Lowest Score", value: lowBox, color: "text-rose-600" }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Source</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {hasResults ? (
                            allResults.map((result: any) => {
                              const percentage = (result.score / result.maxMarks) * 100;
                              const isPass = percentage >= (paper.passMark || 40);
                              return (
                                <tr key={result.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                                  <td className="px-8 py-5">
                                    <div className="font-black text-slate-900 dark:text-white capitalize">
                                      {result.studentName}
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 font-bold text-slate-500 font-mono text-xs">
                                    {result.studentCode}
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                    <span className="font-black text-slate-900 dark:text-white">
                                      {result.score}
                                    </span>
                                    <span className="text-slate-400 ml-1 font-bold">
                                      / {result.maxMarks}
                                    </span>
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
                                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                                        result.type === 'MANUAL' 
                                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                                      }`}>
                                        {result.type}
                                      </span>
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
                                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-all disabled:opacity-50"
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
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
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
