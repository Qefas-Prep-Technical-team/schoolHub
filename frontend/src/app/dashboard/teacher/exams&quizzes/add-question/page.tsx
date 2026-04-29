"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
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
import React, { useState, useMemo, useEffect } from "react";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { PDFDownloadLink } from '@react-pdf/renderer';
import SubjectPaperReport from './components/SubjectPaperReport';

export default function TeacherAddQuestionDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const paperId = searchParams.get("paperId");
  const examId = "none";

  const { data: paperData, isLoading: isLoadingPaper, isError: isErrorPaper } = useQuery({
    queryKey: ["paper", paperId],
    queryFn: () => examService.getPaperById(examId, paperId!),
    enabled: !!paperId,
  });

  const paper = paperData as any;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const publishPaperMutation = useMutation({
    mutationFn: () => examService.publishPaper(examId, paperId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Subject paper published successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Publish failed");
    }
  });

  const unpublishPaperMutation = useMutation({
    mutationFn: () => examService.unpublishPaper(examId, paperId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Subject paper unpublished!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
    }
  });

  const deletePaperMutation = useMutation({
    mutationFn: () => examService.deletePaper(examId, paperId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      router.push(`/dashboard/teacher/exams&quizzes`);
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
  const fallbackSchoolId = (user as any)?.schools?.[0]?.schoolId || (user as any)?.tenantId || "";
  const { data: school } = useSchoolProfile(paperSchoolId || fallbackSchoolId);
  
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", paperSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${paperSchoolId}`);
      return data.data || data;
    },
    enabled: !!paperSchoolId && isEditModalOpen,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers", paperSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${paperSchoolId}/teachers`);
      return data.data || data;
    },
    enabled: !!paperSchoolId && isEditModalOpen,
  });

  if (!paperId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-xl font-black text-slate-900 uppercase">Missing Paper ID</h2>
        <p className="text-slate-500">Please provide a valid paper ID to manage questions.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (isLoadingPaper) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-1/3" />
        </div>
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
      </div>
    );
  }

  if (isErrorPaper || !paper) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center pt-20">
        <h2 className="text-xl font-bold text-red-600 mb-2">Paper Not Found</h2>
        <p className="text-slate-500 mb-6">The subject paper you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Admin-matched Header */}
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
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Management Hub</span>
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
            <div className="flex flex-col items-end shrink-0">
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
          <TabsList className="mb-8 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-[1.25rem] w-full max-w-sm border border-slate-200/50 dark:border-slate-800/50">
            <TabsTrigger value="questions" className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2.5 font-black text-xs uppercase tracking-widest transition-all">
              Questions
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2.5 font-black text-xs uppercase tracking-widest transition-all">
              Grades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[70vh]">
                <QuestionManager 
                    paperId={paperId} 
                    examId={examId}
                    paper={paper}
                />
            </div>
          </TabsContent>

          <TabsContent value="grades">
            {(() => {
              const onlineResults = (paper.examAttempts || []).map((a: any) => ({
                id: a.id,
                studentName: a.examAttempt?.student?.name,
                studentCode: a.examAttempt?.student?.studentCode,
                score: a.score,
                maxMarks: a.totalMarks || paper.totalMarks,
                type: 'ONLINE'
              }));

              const manualResults = (paper.grades || [])
                .filter((g: any) => !g.examAttemptId && !g.subjectExamAttemptId)
                .map((g: any) => ({
                id: g.id,
                studentName: g.student?.name,
                studentCode: g.student?.studentCode,
                score: g.score,
                maxMarks: g.maxMarks,
                type: 'MANUAL',
                gradeId: g.id
              }));

              const allResults = [...onlineResults, ...manualResults];
              const hasResults = allResults.length > 0;

              const avgScore = hasResults 
                ? (allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length).toFixed(1)
                : '0.0';
              const highBox = hasResults ? Math.max(...allResults.map(r => r.score)).toFixed(1) : '0.0';
              const lowBox = hasResults ? Math.min(...allResults.map(r => r.score)).toFixed(1) : '0.0';

              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Student Grades</h2>
                      <p className="text-sm font-semibold text-slate-500">Full performance report aligned with school standards</p>
                    </div>

                    {isMounted && hasResults ? (
                      <PDFDownloadLink
                        document={<SubjectPaperReport paper={paper} school={school} attempts={allResults.map(r => ({
                          ...r,
                          totalMarks: r.maxMarks,
                          examAttempt: { student: { name: r.studentName, studentCode: r.studentCode } }
                        }))} />}
                        fileName={`${paper.title?.replace(/\s+/g, '_')}_Report.pdf`}
                      >
                        {({ loading }: any) => (
                          <Button 
                            className="bg-primary text-white font-black px-6 rounded-2xl shadow-xl shadow-primary/20 gap-2 uppercase tracking-widest text-[10px]"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={16} />}
                            Generate Report
                          </Button>
                        )}
                      </PDFDownloadLink>
                    ) : (
                      <Button className="bg-slate-200 text-slate-400 font-bold px-6 rounded-2xl cursor-not-allowed border border-slate-300 uppercase tracking-widest text-[10px]" disabled>
                        <FileText size={16} />
                        Report Unavailable
                      </Button>
                    )}
                  </div>

                  {hasResults && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Total Sat", value: allResults.length, color: "text-primary" },
                        { label: "Average", value: avgScore, color: "text-blue-600" },
                        { label: "Highest", value: highBox, color: "text-emerald-600" },
                        { label: "Lowest", value: lowBox, color: "text-rose-600" }
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
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Code</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
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
                                    <div className="font-black text-slate-900 dark:text-white capitalize truncate max-w-[200px]">
                                      {result.studentName}
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 font-bold text-slate-500 font-mono text-xs">
                                    {result.studentCode}
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                    <span className="font-black text-slate-900 dark:text-white">{result.score}</span>
                                    <span className="text-slate-400 ml-1 font-bold">/ {result.maxMarks}</span>
                                  </td>
                                  <td className="px-8 py-5">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
                                      </div>
                                      <span className="text-[10px] font-black text-slate-600">{percentage.toFixed(0)}%</span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                                        result.type === 'MANUAL' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                                      }`}>
                                        {result.type}
                                      </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                  <FileText className="opacity-20" size={48} />
                                  <p className="font-extrabold uppercase tracking-widest text-xs">Waiting for student submissions</p>
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

      {/* Admin Modals */}
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
        paperId={paperId!}
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
        isLoadingData={false}
      />
    </div>
  );
}
