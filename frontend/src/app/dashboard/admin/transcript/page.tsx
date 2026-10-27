"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { StudentTranscriptSelector } from "./components/StudentTranscriptSelector";
import { TranscriptPreview } from "./components/TranscriptPreview";
import { GraduationCap, ArrowLeft, ShieldCheck, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminTranscriptPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user } = useAuthStore();
  const schoolId =
    user?.schools?.[0]?.schoolId ||
    (user as any)?.schools?.[0]?.id ||
    (user as any)?.schoolId ||
    user?.tenantId ||
    "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";

  // URL state synchronization
  const urlStudentId = searchParams.get("studentId");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(urlStudentId);

  useEffect(() => {
    setSelectedStudentId(urlStudentId);
  }, [urlStudentId]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("studentId", studentId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBackToSelector = () => {
    setSelectedStudentId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("studentId");
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 font-sans">
      {/* ── Top Breadcrumbs & Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-400 mb-1 flex-wrap">
            <Link href="/dashboard/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-400">Academics</span>
            <span>/</span>
            {selectedStudentId ? (
              <>
                <button
                  onClick={handleBackToSelector}
                  className="hover:text-blue-600 dark:hover:text-blue-400 text-slate-400 transition-colors"
                >
                  Academic Transcripts
                </button>
                <span>/</span>
                <span className="text-slate-800 dark:text-zinc-200">Transcript Preview</span>
              </>
            ) : (
              <span className="text-slate-800 dark:text-zinc-200">Academic Transcripts</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs">
              <GraduationCap size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedStudentId ? "Academic Transcript Preview" : "Official Academic Transcripts"}
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs font-medium p-3 rounded-xl bg-slate-900 text-white shadow-xl">
                      Generate, audit, and certify official cumulative academic transcripts for enrolled scholars. Review terminal grade breakdowns across sessions, calculate verified CGPA on a standard 5.00 scale, and export institutional PDF transcripts with registrar endorsements.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {selectedStudentId
                  ? "Inspecting certified cumulative evaluations, continuous assessments, and official registrar endorsements."
                  : "Select an enrolled scholar from your school roster to preview and generate their official certified transcript."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Body: Either Selector (First Page) or Preview ─────────────── */}
      {selectedStudentId ? (
        <TranscriptPreview
          studentId={selectedStudentId}
          schoolId={schoolId}
          onBack={handleBackToSelector}
          onSelectStudent={handleSelectStudent}
          primaryColor={primaryColor}
        />
      ) : (
        <StudentTranscriptSelector
          schoolId={schoolId}
          onSelectStudent={handleSelectStudent}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}
