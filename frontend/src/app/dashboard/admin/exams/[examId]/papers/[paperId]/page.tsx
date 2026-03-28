"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Settings, Loader2, Check } from "lucide-react";
import { toast } from "react-toastify";
import QuestionManager from "./components/QuestionManager";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import { useState } from "react";

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

  const validatePaperMutation = useMutation({
    mutationFn: () => examService.validatePaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Subject paper validated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Validation failed");
    }
  });

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

  if (isLoadingPaper || isLoadingExam) {
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
        <p className="text-gray-500 mb-6">You do not have permission to manage questions for this subject paper.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950/30">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{exam?.title || "Exam"}</span>
                <span className="text-gray-300 dark:text-gray-700">/</span>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate max-w-[200px] md:max-w-md">
                  {paper.title}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {paper.status === "PUBLISHED" ? (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1.5 mr-2">
                  <Check size={14} /> Published
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => openConfirmDialog({
                    title: "Unpublish Paper",
                    description: `Are you sure you want to unpublish "${paper.title}"? It will be moved back to draft.`,
                    variant: "warning",
                    confirmText: "Unpublish",
                    onConfirm: () => unpublishPaperMutation.mutate(undefined, {
                      onSuccess: () => {
                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                        toast.success("Subject paper unpublished!");
                      },
                      onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Failed to unpublish paper");
                      }
                    })
                  })}
                  disabled={unpublishPaperMutation.isPending}
                >
                  {unpublishPaperMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Unpublish"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl"
                  onClick={() => validatePaperMutation.mutate()}
                  disabled={validatePaperMutation.isPending || paper.status === "APPROVED"}
                >
                  {validatePaperMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : paper.status === "APPROVED" ? "Validated" : "Validate"}
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                  onClick={() => publishPaperMutation.mutate()}
                  disabled={publishPaperMutation.isPending || paper.status !== "APPROVED"}
                >
                  {publishPaperMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Publish Paper"}
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => openConfirmDialog({
                title: "Delete Paper",
                description: `This will permanently delete "${paper.title}" and all its questions. This action cannot be undone.`,
                variant: "danger",
                confirmText: "Delete Paper",
                onConfirm: () => deletePaperMutation.mutate(undefined, {
                  onSuccess: () => {
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    toast.success("Subject paper deleted!");
                  },
                  onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to delete paper");
                  }
                })
              })}
              disabled={deletePaperMutation.isPending}
            >
              {deletePaperMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete Paper"}
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
    </div>
  );
}
