"use client";

import { useParams, useRouter } from "next/navigation";
import { useExam, useExamAttempt } from "@/lib/api/hooks/useExams";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

/**
 * ExamStatusRouter
 * Central entry point for student exams.
 * Redirects students to the appropriate page based on their attempt status.
 */
export default function ExamStatusRouter() {
  const { examId } = useParams();
  const router = useRouter();
  
  const { data: exam, isLoading: isLoadingExam } = useExam(examId as string);
  const { data: attempt, isLoading: isLoadingAttempt, isError: isErrorAttempt } = useExamAttempt(examId as string);

  useEffect(() => {
    if (isLoadingExam || isLoadingAttempt) return;

    // If no attempt or in progress, go to the unified exam route
    if (isErrorAttempt || !attempt || attempt.status === "IN_PROGRESS") {
      router.replace(`/Exams&Quizzes/exam/${examId}`);
      return;
    }

    // If attempt is finished, go to result
    if (attempt.status === "SUBMITTED" || attempt.status === "SCORED" || attempt.status === "EXPIRED") {
      router.replace(`/dashboard/student/exams&quizzes/${examId}/result`);
    }
  }, [exam, attempt, isLoadingExam, isLoadingAttempt, isErrorAttempt, examId, router]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-slate-500 animate-pulse">Checking exam status...</p>
    </div>
  );
}
