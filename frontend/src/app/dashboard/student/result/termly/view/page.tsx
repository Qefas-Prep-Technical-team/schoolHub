"use client";

import { useState, useEffect, useMemo } from "react";
import { useMyPublishedResults } from "@/lib/api/hooks/useRecords";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Lock,
  TrendingUp,
  Award,
  BarChart3,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List,
  Calendar,
  AlertCircle,
  Download,
  Loader2,
  Search
} from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generatePDF } from "@/utils/pdfGenerator";
import { assertSchoolPayingPlan } from "@/utils/subscriptionPlanCheck";
import { useStudentProfile } from "@/lib/api/hooks/useStudent";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { getGradeEvaluation } from "@/utils/gradingSystem";
import { toast } from "react-toastify";
import { StudentTermResultExportModal } from "../components/StudentTermResultExportModal";
import { TermResultSpreadsheetData } from "../utils/termResultSpreadsheetExporter";

interface SubjectResultRecord {
  id: string;
  scoresRevealed?: boolean;
  totalScore?: number | null;
  assignmentScore?: number | null;
  caScore?: number | null;
  quizScore?: number | null;
  examScore?: number | null;
  grade?: string | null;
  subject?: {
    id?: string;
    name?: string;
    code?: string;
  };
}

interface TermResultGroup {
  sessionId: string;
  term: string;
  subjectCount: number;
  revealedCount: number;
  class?: {
    id?: string;
    name?: string;
  };
  session?: {
    id?: string;
    name?: string;
  };
  subjectResults?: SubjectResultRecord[];
}

function getTermLabel(term: string): string {
  const map: Record<string, string> = {
    FIRST: "1st Term",
    SECOND: "2nd Term",
    THIRD: "3rd Term",
  };
  return map[term] || term;
}

function getTermGradient(term: string): string {
  const map: Record<string, string> = {
    FIRST: "from-violet-600 via-indigo-600 to-indigo-700",
    SECOND: "from-pink-500 via-rose-500 to-pink-600",
    THIRD: "from-amber-500 via-orange-500 to-amber-600",
  };
  return map[term] || "from-zinc-700 to-zinc-800";
}

function getScoreColor(total: number | null, customGradingSystem?: any[] | null): string {
  if (total == null) return "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 border border-slate-200 dark:border-zinc-800";
  const evalResult = getGradeEvaluation(total, customGradingSystem);
  return cn(evalResult.bg, evalResult.color, "border");
}

function getGradeLetter(total: number | null, customGradingSystem?: any[] | null): string {
  if (total == null) return "—";
  const evalResult = getGradeEvaluation(total, customGradingSystem);
  return evalResult.grade || "F9";
}

function NACell() {
  return (
    <span className="inline-flex items-center gap-1 text-zinc-400 dark:text-zinc-600 text-xs italic">
      <Lock className="w-3 h-3" /> N/A
    </span>
  );
}

function ResultViewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId") ?? "";
  const term = searchParams.get("term") ?? "";

  const { data: rawResults = [], isLoading } = useMyPublishedResults();
  const results = rawResults as TermResultGroup[];
  const { data: profile } = useStudentProfile();
  const { user } = useAuthStore();
  const userRecord = user as Record<string, unknown> | null | undefined;
  const schoolId =
    profile?.schoolId ||
    user?.schools?.[0]?.schoolId ||
    (typeof userRecord?.schoolId === 'string' ? userRecord.schoolId : '') ||
    user?.tenantId ||
    '';
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const customGradingSystem = schoolProfile?.gradingSystem;
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");

  const group = results.find(
    (g) => g.sessionId === sessionId && g.term === term
  );

  const termExportData: TermResultSpreadsheetData | null = useMemo(() => {
    if (!group) return null;
    const termLabel = getTermLabel(term);
    const sessionLabel = group.session?.name || "Academic Session";
    const className = group.class?.name || profile?.classes?.[0]?.class?.name || "Enrolled Class";
    const studentName = profile?.name || user?.name || "Student";
    const studentCode = profile?.studentCode || user?.studentCode || "N/A";

    const subjectResultsList: SubjectResultRecord[] = group.subjectResults ?? [];
    const releasedSubs = subjectResultsList.filter((s) => s.scoresRevealed);
    const scoreTotals = releasedSubs
      .map((s) => Number(s.totalScore ?? 0))
      .filter((n) => !isNaN(n));
    const termAverage = scoreTotals.length > 0 ? scoreTotals.reduce((a, b) => a + b, 0) / scoreTotals.length : null;

    const records = subjectResultsList.map((subject) => {
      const released = Boolean(subject.scoresRevealed);
      const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;
      const grade = released && total != null ? getGradeLetter(total, customGradingSystem) : "—";
      const assignment = released ? (subject.assignmentScore != null ? String(subject.assignmentScore) : "—") : "N/A";
      const quiz = released ? (subject.quizScore != null ? String(subject.quizScore) : "—") : "N/A";
      const ca = released ? (subject.caScore != null ? String(subject.caScore) : "—") : "N/A";
      const exam = released ? (subject.examScore != null ? String(subject.examScore) : "—") : "N/A";
      const totalStr = released && total != null ? String(total) : "N/A";
      const evalResult = total != null ? getGradeEvaluation(total, customGradingSystem) : null;
      const status = released ? (evalResult?.remark || (evalResult?.grade !== "F9" && evalResult?.grade !== "F" ? "PASS" : "FAIL")) : "PENDING";

      return {
        courseCode: subject.subject?.code || "—",
        subjectTitle: subject.subject?.name || "Untitled Subject",
        assignmentScore: assignment,
        quizScore: quiz,
        caScore: ca,
        examScore: exam,
        totalScore: totalStr,
        grade,
        status,
      };
    });

    return {
      studentName,
      studentCode,
      className,
      sessionName: sessionLabel,
      termName: termLabel,
      revealedCount: group.revealedCount || 0,
      totalCount: group.subjectCount || 0,
      averageScore: termAverage,
      records,
    };
  }, [group, term, profile, user, customGradingSystem]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-pulse">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Term Results</span>
        </button>

        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mb-4 text-rose-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">Result Sheet Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-sm mb-5">
            This term result sheet is either not yet published by your school administration or you do not have permission to access it.
          </p>
          <Button
            onClick={() => router.push("/dashboard/student/result/termly")}
            className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs sm:text-sm px-4 h-10 shadow-sm"
          >
            Return to Published Terms
          </Button>
        </div>
      </div>
    );
  }

  const { subjectCount, revealedCount } = group;
  const subjectResults: SubjectResultRecord[] = group.subjectResults ?? [];
  const filteredSubjectResults = searchQuery.trim()
    ? subjectResults.filter((s) => {
      const query = searchQuery.toLowerCase();
      const name = (s.subject?.name || "").toLowerCase();
      const code = (s.subject?.code || "").toLowerCase();
      return name.includes(query) || code.includes(query);
    })
    : subjectResults;
  const gradient = getTermGradient(group.term);

  // Stats only from subjects with released scores
  const releasedSubjects = subjectResults.filter((s) => s.scoresRevealed);
  const totals = releasedSubjects
    .map((s) => Number(s.totalScore ?? 0))
    .filter((n) => !isNaN(n));
  const avg = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : null;
  const highest = totals.length > 0 ? Math.max(...totals) : null;
  const lowest = totals.length > 0 ? Math.min(...totals) : null;

  // Status badge for the hero
  const allReleased = revealedCount === subjectCount && subjectCount > 0;
  const someReleased = revealedCount > 0 && revealedCount < subjectCount;
  const noneReleased = revealedCount === 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">

      {/* Top Back Navigation & Export PDF Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors group self-start"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Published Results</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
            {group.session?.name || "Session"} • {getTermLabel(group.term)}
          </span>
          <Button
            onClick={() => setIsExportModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Result Sheet</span>
          </Button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-5 sm:p-7 md:p-8 text-white shadow-lg`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {getTermLabel(group.term)}
                </span>
                <span className="opacity-60 text-xs">•</span>
                <span className="text-xs font-medium opacity-90">{group.session?.name || "Academic Session"}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black mt-1 leading-tight tracking-tight">
                {group.class?.name || "Class Cohort"}
              </h1>
              <p className="text-xs sm:text-sm opacity-80 mt-0.5">
                {subjectCount} Subject{subjectCount !== 1 ? "s" : ""} Evaluated
                {someReleased && ` · ${revealedCount} released`}
              </p>
            </div>
          </div>

          {/* Summary stats on banner */}
          {allReleased && avg != null ? (
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 text-center min-w-[76px] sm:min-w-[85px]">
                <p className="text-[10px] uppercase font-bold opacity-75 tracking-wider">Average</p>
                <p className="text-xl sm:text-2xl font-black">{avg.toFixed(1)}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 text-center min-w-[76px] sm:min-w-[85px]">
                <p className="text-[10px] uppercase font-bold opacity-75 tracking-wider">Highest</p>
                <p className="text-xl sm:text-2xl font-black">{highest}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 text-center min-w-[76px] sm:min-w-[85px]">
                <p className="text-[10px] uppercase font-bold opacity-75 tracking-wider">Lowest</p>
                <p className="text-xl sm:text-2xl font-black">{lowest}</p>
              </div>
            </div>
          ) : noneReleased ? (
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm">
              <Eye className="w-5 h-5 opacity-80 shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-snug">
                Subjects are published on your roster, but examination scores are still under administrative review.
              </p>
            </div>
          ) : someReleased && avg != null ? (
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-75 tracking-wider">Released Avg</p>
                <p className="text-xl sm:text-2xl font-black">{avg.toFixed(1)}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-75 tracking-wider">Coverage</p>
                <p className="text-xl sm:text-2xl font-black">{revealedCount}/{subjectCount}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Info Callouts */}
      {noneReleased && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 text-amber-800 dark:text-amber-300">
          <Eye className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Scores not yet finalized</p>
            <p className="opacity-90 mt-0.5">
              Your subjects are listed below, but official marks are pending completion of grading by subject teachers. Check back soon.
            </p>
          </div>
        </div>
      )}
      {someReleased && (
        <div className="flex items-start gap-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-4 text-sky-800 dark:text-sky-300">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Partial scores released</p>
            <p className="opacity-90 mt-0.5">
              {revealedCount} of {subjectCount} subjects have released marks. The remaining subjects display N/A until certified by the exam committee.
            </p>
          </div>
        </div>
      )}

      {/* Subject Results Section */}
      <div className="space-y-4">
        {/* Section Header with View Toggle & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Subject Score Sheet
                </h2>
                <HeaderTooltip
                  content="Detailed grade registry showing component breakdown for each subject: homework assignments, continuous assessments, and final exam papers."
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Official marks breakdown and evaluation for {getTermLabel(group.term)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            {/* Search filter input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search subject or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-pink-500/30 transition-all"
              />
            </div>

            {/* View Toggle (Table is default) */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                aria-label="Table perspective"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid perspective"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Mode: Cards Grid vs Table */}
        {viewMode === "grid" ? (
          filteredSubjectResults.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 text-sm">
              No subjects matched your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredSubjectResults.map((subject) => {
                const released = Boolean(subject.scoresRevealed);
                const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;
                const grade = getGradeLetter(total, customGradingSystem);

                return (
                  <div
                    key={subject.id}
                    className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Subject header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${released ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"}`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-snug truncate">
                              {subject.subject?.name || "Subject"}
                            </h3>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              {subject.subject?.code || "COURSE"}
                            </p>
                          </div>
                        </div>

                        {/* Grade Badge */}
                        {released && total != null ? (
                          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-sm ${getScoreColor(total, customGradingSystem)}`}>
                            <span>{grade}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full shrink-0">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Breakdown metrics 4-col */}
                      <div className="grid grid-cols-4 gap-1.5 py-2.5 px-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 text-center my-2 text-xs">
                        <div>
                          <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Assign</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {released ? (subject.assignmentScore != null ? subject.assignmentScore : "—") : <NACell />}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quiz</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {released ? (subject.quizScore != null ? subject.quizScore : "—") : <NACell />}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">CA</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {released ? (subject.caScore != null ? subject.caScore : "—") : <NACell />}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Exam</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {released ? (subject.examScore != null ? subject.examScore : "—") : <NACell />}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total score footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Cumulative Total</span>
                      {released && total != null ? (
                        <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                          {total} <span className="text-[10px] text-zinc-400 font-normal">/ 100</span>
                        </span>
                      ) : (
                        <NACell />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-100 dark:border-zinc-800/80">
                    <th className="px-5 py-4 w-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      #
                    </th>
                    <th className="px-5 py-4 min-w-[220px] text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Subject & Code
                    </th>
                    <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Assignment
                    </th>
                    <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Quiz/Test
                    </th>
                    <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      CA
                    </th>
                    <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Exam
                    </th>
                    <th className="px-5 py-4 w-32 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Total Score
                    </th>
                    <th className="px-4 py-4 w-24 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Grade
                    </th>
                    <th className="px-5 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      Standing
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-slate-600 dark:text-slate-300 font-medium">
                  {filteredSubjectResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500">
                        No subject records found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjectResults.map((subject, idx) => {
                      const released = Boolean(subject.scoresRevealed);
                      const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;
                      const grade = getGradeLetter(total, customGradingSystem);
                      const evalResult = total != null ? getGradeEvaluation(total, customGradingSystem) : null;

                      return (
                        <tr
                          key={subject.id}
                          className="group hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="px-5 py-4 text-center text-slate-400 dark:text-zinc-500 font-mono text-xs">
                            {String(idx + 1).padStart(2, "0")}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${released
                                  ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                                  }`}
                              >
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                                  {subject.subject?.name || "Subject"}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                    {subject.subject?.code || "COURSE"}
                                  </span>
                                  {!released && (
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/40">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {released ? (
                              subject.assignmentScore != null ? (
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {subject.assignmentScore}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-zinc-600">—</span>
                              )
                            ) : (
                              <NACell />
                            )}
                          </td>

                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {released ? (
                              subject.quizScore != null ? (
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {subject.quizScore}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-zinc-600">—</span>
                              )
                            ) : (
                              <NACell />
                            )}
                          </td>

                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {released ? (
                              subject.caScore != null ? (
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {subject.caScore}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-zinc-600">—</span>
                              )
                            ) : (
                              <NACell />
                            )}
                          </td>

                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {released ? (
                              subject.examScore != null ? (
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {subject.examScore}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-zinc-600">—</span>
                              )
                            ) : (
                              <NACell />
                            )}
                          </td>

                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            {released && total != null ? (
                              <span
                                className={`inline-flex items-center justify-center min-w-[3.5rem] px-2.5 py-1 rounded-lg text-xs font-bold ${getScoreColor(
                                  total,
                                  customGradingSystem
                                )}`}
                              >
                                {total}
                              </span>
                            ) : (
                              <NACell />
                            )}
                          </td>

                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {released && total != null ? (
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black shadow-xs ${getScoreColor(
                                  total,
                                  customGradingSystem
                                )}`}
                              >
                                {grade}
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-bold">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            {released && total != null && evalResult ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                {evalResult.remark || (evalResult.grade !== "F9" && evalResult.grade !== "F" ? "PASS" : "FAIL")}
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aggregate Summary Footer */}
        {releasedSubjects.length > 0 && (
          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Term Average</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{avg != null ? `${avg.toFixed(1)}%` : "—"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Highest Score</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{highest ?? "—"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Released Coverage</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{revealedCount} / {subjectCount} subjects</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsExportModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Result Sheet</span>
            </Button>
          </div>
        )}

        <StudentTermResultExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          data={termExportData}
          schoolProfile={schoolProfile || profile?.school || user?.schools?.[0]}
          schoolId={schoolId}
        />
      </div>
    </div>
  );
}

export default function StudentResultViewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-pulse">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      }
    >
      <ResultViewInner />
    </Suspense>
  );
}
