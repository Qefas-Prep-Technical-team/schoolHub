"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Legacy Redirect for Preview
 */
export default function LegacyPreviewRedirect() {
  const { examId } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/student/exams&quizzes/${examId}`);
  }, [examId, router]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-slate-500">Redirecting to exam...</p>
    </div>
  );
}
