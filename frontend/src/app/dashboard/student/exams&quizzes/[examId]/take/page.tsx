"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Legacy Redirect for Take
 */
export default function LegacyTakeRedirect() {
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

// Simple Badge component if not imported
function Badge({ children, className, variant = "default" }: any) {
  const variants: any = {
    default: "bg-primary text-white border-transparent",
    outline: "bg-transparent text-slate-700 border-slate-200 dark:text-slate-300 dark:border-slate-800",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  );
}
