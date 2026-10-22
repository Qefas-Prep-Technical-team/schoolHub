"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  ArrowRight,
  Clock,
  Eye
} from "lucide-react";
import { useParentStore } from "@/lib/api/hooks/useParentStore";
import { useParentChildren, useChildResults } from "@/lib/api/hooks/useParentChildren";
import { getGradeEvaluation } from "@/utils/gradingSystem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PublishedSubjectResult {
  id?: string;
  scoresRevealed?: boolean;
  totalScore?: number | null;
  assignmentScore?: number | null;
  caScore?: number | null;
  quizScore?: number | null;
  examScore?: number | null;
  grade?: string | null;
  releaseDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  subject?: {
    id?: string;
    name?: string;
    code?: string;
  };
}

interface PublishedResultGroup {
  sessionId: string;
  term: string;
  class?: {
    id?: string;
    name?: string;
  };
  session?: {
    id?: string;
    name?: string;
  };
  subjectCount: number;
  revealedCount: number;
  releaseDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  subjectResults?: PublishedSubjectResult[];
}

function getTermLabel(term: string): string {
  const map: Record<string, string> = { 
    FIRST: "1st Term", 
    SECOND: "2nd Term", 
    THIRD: "3rd Term" 
  };
  return map[term] || term;
}

export default function FinalResultsBanner() {
  const { selectedChildId } = useParentStore();
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren();

  // Resolve currently active child from top nav selection, falling back to first connected child
  const activeChildId = useMemo(() => {
    if (selectedChildId && children.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return children[0]?.id;
  }, [selectedChildId, children]);

  const activeChild = useMemo(() => {
    return children.find((c) => c.id === activeChildId);
  }, [children, activeChildId]);

  const { data: rawResults, isLoading: isResultsLoading } = useChildResults(activeChildId ?? null);
  const results = (Array.isArray(rawResults) ? rawResults : []) as PublishedResultGroup[];

  // Analyze latest published result for the active child
  const resultData = useMemo(() => {
    if (!results || results.length === 0) return null;

    const latest = results[0];
    const { subjectCount = 0, revealedCount = 0 } = latest;
    const subjectResults = latest.subjectResults || [];

    // Calculate average score across released subjects
    const releasedScores = subjectResults
      .filter((s) => s.scoresRevealed && s.totalScore != null)
      .map((s) => Number(s.totalScore))
      .filter((n) => !isNaN(n));

    const avgScore = releasedScores.length > 0
      ? Math.round((releasedScores.reduce((a, b) => a + b, 0) / releasedScores.length) * 10) / 10
      : null;

    const rawGradingSystem = (activeChild as unknown as { school?: { gradingSystem?: unknown } })?.school?.gradingSystem;
    const gradingSystem = Array.isArray(rawGradingSystem) ? rawGradingSystem : undefined;
    const gradeEvaluation = avgScore != null ? getGradeEvaluation(avgScore, gradingSystem) : null;

    // Only display if a final result with revealed scores was released or created within the last 7 days
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const isRecent = (() => {
      // Never show banner if no subject scores have been revealed
      if (revealedCount === 0) return false;

      // 1. Check individual revealed subject results
      const hasRecentSubject = subjectResults.some((s) => {
        if (!s.scoresRevealed) return false;
        const rawDate = s.releaseDate || s.updatedAt || s.createdAt;
        if (!rawDate) return false;
        const time = new Date(rawDate).getTime();
        if (isNaN(time)) return false;
        const diff = now - time;
        return diff >= 0 && diff <= SEVEN_DAYS_MS;
      });

      if (hasRecentSubject) return true;

      // 2. Check group-level timestamps if subjects are revealed
      const rawGroupDate = latest.releaseDate || latest.updatedAt || latest.createdAt;
      if (rawGroupDate) {
        const time = new Date(rawGroupDate).getTime();
        if (!isNaN(time)) {
          const diff = now - time;
          return diff >= 0 && diff <= SEVEN_DAYS_MS;
        }
      }

      return false;
    })();

    return {
      latest,
      subjectCount,
      revealedCount,
      allRevealed: revealedCount === subjectCount && subjectCount > 0,
      someRevealed: revealedCount > 0 && revealedCount < subjectCount,
      noneRevealed: revealedCount === 0,
      avgScore,
      gradeEvaluation,
      isRecent,
    };
  }, [results, activeChild]);

  // Strictly only show banner within 7 days of result release/creation and when scores are revealed
  if (
    isChildrenLoading || 
    isResultsLoading || 
    !resultData || 
    !activeChild || 
    !resultData.isRecent || 
    resultData.revealedCount === 0
  ) {
    return null;
  }

  const { latest, subjectCount, revealedCount, allRevealed, avgScore, gradeEvaluation, isRecent } = resultData;
  const childName = activeChild.name || "Student";
  const sessionName = latest.session?.name || "Current Session";
  const termLabel = getTermLabel(latest.term);
  const className = latest.class?.name || activeChild.currentClass?.name || "Current Class";

  const viewSheetHref = `/dashboard/parent/result/termly/view?sessionId=${latest.sessionId}&term=${latest.term}&childId=${activeChild.id}`;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-900 border border-emerald-500/30 p-5 sm:p-7 md:p-8 text-white shadow-xl shadow-emerald-600/15 transition-all">
      {/* Decorative ambient glowing circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-400/20 dark:bg-teal-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Badge, Details, and Context */}
        <div className="space-y-3.5 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/20 dark:bg-white/15 backdrop-blur-md text-amber-300 border border-white/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{isRecent ? "New Final Results Available" : "Official Final Results Published"}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-black/20 text-white/90 border border-white/10 backdrop-blur-sm">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{termLabel} • {sessionName}</span>
            </span>

            {allRevealed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Scores Verified</span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Final Results Available for {childName}!
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Official terminal report card and academic evaluation sheets for <strong className="text-white">{className}</strong> are ready for review. Access detailed scores, teacher remarks, and WAEC performance grades.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="text-white font-bold">{revealedCount}/{subjectCount}</span>
              <span className="text-emerald-200/80">Subjects Released</span>
            </div>

            {avgScore != null && (
              <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-white font-bold">{avgScore}%</span>
                {gradeEvaluation && (
                  <span className="text-amber-200 font-bold uppercase tracking-wide text-[11px]">
                    ({gradeEvaluation.grade} • {gradeEvaluation.remark})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href={viewSheetHref} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white hover:bg-slate-50 dark:hover:bg-zinc-100 text-emerald-700 dark:text-emerald-800 font-black rounded-xl h-11 sm:h-12 px-6 sm:px-7 shadow-lg shadow-black/10 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 group transition-all active:scale-[0.98]">
              <span>View Final Result</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="/dashboard/parent/result/termly" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/20 rounded-xl h-11 sm:h-12 px-5 font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all active:scale-[0.98]"
            >
              All Term Results
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
