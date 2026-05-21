"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText, Trash2, Unlink, Loader2 } from "lucide-react";
import Link from "next/link";
import SubjectPaperCard from "../../components/SubjectPaperCard";
import AddExistingPaperModal from "../../components/AddExistingPaperModal";
import { toast } from "react-toastify";

export default function ExamPapersPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const examId = params.examId as string;
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";

  const { data: exam, isLoading: isLoadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examService.getExamById(examId),
    enabled: !!examId,
  });

  const { data: papers = [], isLoading: isLoadingPapers } = useQuery({
    queryKey: ["exam-papers", examId],
    queryFn: () => examService.getExamPapers(examId),
    enabled: !!examId,
  });

  const unlinkMutation = useMutation({
    mutationFn: (paperId: string) => examService.unlinkSubjectPaper(paperId, examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      toast.success("Subject paper unlinked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unlink paper");
    },
  });

  const isLoading = isLoadingExam || isLoadingPapers;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div>
          <Link
            href="/dashboard/admin/exams"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Exams
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                {isLoading ? (
                  <Skeleton className="h-10 w-64 rounded-xl" />
                ) : (
                  exam?.title || "Exam Papers"
                )}
              </h1>
              <p className="text-slate-500 mt-2 text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-96 rounded-lg" />
                ) : (
                  exam?.description || "Manage subject papers for this exam"
                )}
              </p>
            </div>
            {!isLoading && (
              <div className="flex items-center gap-3">
                <AddExistingPaperModal examId={examId} />
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[280px] rounded-[3rem]" />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
            <div className="size-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-xl">
              <FileText size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                No Papers Linked
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                There are no subject papers linked to this exam. Link an existing paper to start.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {papers.map((paper) => (
              <div key={paper.id} className="relative group">
                <SubjectPaperCard paper={paper} examId={examId} />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    unlinkMutation.mutate(paper.id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute right-24 top-10 size-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-amber-100 hover:text-amber-600 dark:hover:border-amber-500/20 transition-all shadow-sm z-20"
                  title="Unlink Paper"
                  disabled={unlinkMutation.isPending}
                >
                  {unlinkMutation.isPending && unlinkMutation.variables === paper.id ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Unlink size={18} />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
