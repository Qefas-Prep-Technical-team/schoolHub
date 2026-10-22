"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useChildResults, useChildDetails } from "@/lib/api/hooks/useParentChildren";
import { useParentStore } from "@/lib/api/hooks/useParentStore";
import { getGradeEvaluation } from "@/utils/gradingSystem";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
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
  Search,
  X,
  AlertCircle,
  Download
} from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/parent/components/dashboard/HeaderTooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generatePDF } from "@/utils/pdfGenerator";
import { assertSchoolPayingPlan } from "@/utils/subscriptionPlanCheck";

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
    FIRST:  "from-violet-600 via-indigo-600 to-indigo-700",
    SECOND: "from-pink-500 via-rose-500 to-pink-600",
    THIRD:  "from-amber-500 via-orange-500 to-amber-600",
  };
  return map[term] || "from-zinc-700 to-zinc-800";
}

function getScoreColor(total: number | null): string {
  if (total == null) return "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500";
  if (total >= 70) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50";
  if (total >= 60) return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50";
  if (total >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50";
  return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50";
}

function getGradeLetter(total: number | null, customGradingSystem?: unknown[]): string {
  if (total == null) return "—";
  return getGradeEvaluation(total, customGradingSystem).grade;
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
  const term      = searchParams.get("term") ?? "";
  const childId   = searchParams.get("childId") ?? "";

  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId || "";

  const { data: rawResults = [], isLoading } = useChildResults(effectiveChildId || null);
  const { data: childDetails } = useChildDetails(effectiveChildId || null);
  const results = (Array.isArray(rawResults) ? rawResults : []) as TermResultGroup[];

  const schoolGradingSystem = useMemo(() => {
    const raw = childDetails?.school?.gradingSystem;
    return Array.isArray(raw) ? (raw as unknown[]) : undefined;
  }, [childDetails?.school?.gradingSystem]);

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);

  const group = useMemo(() => {
    return results.find((g) => g.sessionId === sessionId && g.term === term);
  }, [results, sessionId, term]);

  const subjectResults: SubjectResultRecord[] = useMemo(() => {
    return group?.subjectResults ?? [];
  }, [group]);

  // Search filter
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjectResults;
    const q = searchQuery.toLowerCase().trim();
    return subjectResults.filter((item) => {
      const name = item.subject?.name?.toLowerCase() || "";
      const code = item.subject?.code?.toLowerCase() || "";
      return name.includes(q) || code.includes(q);
    });
  }, [subjectResults, searchQuery]);

  // Stats only from subjects with released scores
  const { releasedSubjects, avg, highest, lowest, allReleased, someReleased, noneReleased } = useMemo(() => {
    if (!group) {
      return {
        releasedSubjects: [],
        avg: null,
        highest: null,
        lowest: null,
        allReleased: false,
        someReleased: false,
        noneReleased: true,
      };
    }
    const released = (group.subjectResults ?? []).filter((s) => s.scoresRevealed);
    const totals = released
      .map((s) => Number(s.totalScore ?? 0))
      .filter((n) => !isNaN(n));
    const average = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : null;
    const high = totals.length > 0 ? Math.max(...totals) : null;
    const low = totals.length > 0 ? Math.min(...totals) : null;
    const { subjectCount = 0, revealedCount = 0 } = group;

    return {
      releasedSubjects: released,
      avg: average,
      highest: high,
      lowest: low,
      allReleased: revealedCount === subjectCount && subjectCount > 0,
      someReleased: revealedCount > 0 && revealedCount < subjectCount,
      noneReleased: revealedCount === 0,
    };
  }, [group]);

  const handleExportPDF = async () => {
    if (!assertSchoolPayingPlan(childDetails?.school)) {
      return;
    }

    const termLabel = getTermLabel(term);
    const sessionLabel = group?.session?.name || "Academic Session";
    const className = group?.class?.name || "N/A";
    const studentName = childDetails?.name || "Student";
    const studentCode = childDetails?.studentCode || "N/A";

    const tableHeaders = [
      ["#", "Course Code", "Subject Title", "Assignment", "C.A. / Quiz", "Exam", "Total Score", "Grade", "Status"]
    ];

    const tableData = (group?.subjectResults || []).map((subject, index) => {
      const released = Boolean(subject.scoresRevealed);
      const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;
      const grade = released && total != null ? getGradeLetter(total, schoolGradingSystem) : "—";
      const assignment = released ? (subject.assignmentScore != null ? String(subject.assignmentScore) : "—") : "N/A";
      const ca = released ? ((subject.caScore ?? subject.quizScore) != null ? String(subject.caScore ?? subject.quizScore) : "—") : "N/A";
      const exam = released ? (subject.examScore != null ? String(subject.examScore) : "—") : "N/A";
      const totalStr = released && total != null ? String(total) : "N/A";
      const status = released ? (total != null && total >= 50 ? "PASS" : "CREDIT/FAIL") : "PENDING";

      return [
        (index + 1).toString(),
        subject.subject?.code || "—",
        subject.subject?.name || "Untitled Subject",
        assignment,
        ca,
        exam,
        totalStr,
        grade,
        status,
      ];
    });

    await generatePDF({
      title: `${termLabel} Term Result Sheet (${sessionLabel})`,
      filename: `${studentName.replace(/\s+/g, "_")}_${term}_Term_Result_Sheet.pdf`,
      schoolProfile: childDetails?.school,
      metaData: [
        { label: "Student Name", value: studentName },
        { label: "Student ID", value: studentCode },
        { label: "Academic Session", value: sessionLabel },
        { label: "Term", value: termLabel },
        { label: "Class / Grade", value: className },
        { label: "Average Score", value: avg != null ? `${avg.toFixed(1)}%` : "N/A" },
        { label: "Highest Score", value: highest != null ? `${highest}%` : "N/A" },
        { label: "Released Coverage", value: `${group?.revealedCount || 0} / ${group?.subjectCount || 0} Subjects` },
      ],
      tableHeaders,
      tableData,
      orientation: "portrait",
    });
  };

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
          onClick={() => router.push(childId ? `/dashboard/parent/result/termly?childId=${childId}` : "/dashboard/parent/result/termly")}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Published Results</span>
        </button>

        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mb-4 text-rose-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">Result Sheet Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-sm mb-5">
            This term result sheet is either not yet published by your school administration or your linked child does not have access to it.
          </p>
          <Button
            onClick={() => router.push(childId ? `/dashboard/parent/result/termly?childId=${childId}` : "/dashboard/parent/result/termly")}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm px-4 h-10 shadow-sm cursor-pointer"
          >
            Return to Published Terms
          </Button>
        </div>
      </div>
    );
  }

  const { subjectCount, revealedCount } = group;
  const gradient = getTermGradient(group.term);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.push(childId ? `/dashboard/parent/result/termly?childId=${childId}` : "/dashboard/parent/result/termly")}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Published Results</span>
        </button>

        <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
          {group.session?.name || "Session"} • {getTermLabel(group.term)}
        </span>
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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-bold text-white text-base sm:text-lg">
                  {childDetails?.name || "Student"}
                </span>
                {childDetails?.studentCode && (
                  <span className="text-[10px] sm:text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-semibold tracking-wide">
                    ID: {childDetails.studentCode}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-black mt-0.5 leading-tight tracking-tight">
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Subject Score Sheet
            </h2>
            <HeaderTooltip 
              content="Detailed grade registry showing component breakdown for each subject: homework assignments, continuous assessments, and final exam papers."
            />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full ml-1">
              {filteredSubjects.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative w-44 sm:w-56 group">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid perspective"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                aria-label="Table perspective"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Export PDF Button */}
            <Button
              onClick={handleExportPDF}
              className="h-8 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Content Mode: Cards Grid vs Table */}
        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
            <BookOpen className="w-8 h-8 text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No subjects found</h4>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 animate-in fade-in duration-200">
            {filteredSubjects.map((subject) => {
              const released = Boolean(subject.scoresRevealed);
              const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;
              const grade = getGradeLetter(total, schoolGradingSystem);

              return (
                <div 
                  key={subject.id}
                  className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Subject header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${released ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"}`}>
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
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-sm ${getScoreColor(total)}`}>
                          <span>{grade}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Breakdown metrics 3-col */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 text-center my-2 text-xs">
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Assign</p>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                          {released ? (subject.assignmentScore != null ? subject.assignmentScore : "—") : <NACell />}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">CA / Quiz</p>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                          {released ? ((subject.caScore ?? subject.quizScore) != null ? (subject.caScore ?? subject.quizScore) : "—") : <NACell />}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Exam</p>
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
        ) : (
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm animate-in fade-in duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-4">Subject Course</th>
                    <th className="px-5 py-4 text-center">Assignment</th>
                    <th className="px-5 py-4 text-center">CA / Quiz</th>
                    <th className="px-5 py-4 text-center">Exam Paper</th>
                    <th className="px-5 py-4 text-center">Total Score</th>
                    <th className="px-5 py-4 text-center">Official Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                  {filteredSubjects.map((subject) => {
                    const released = Boolean(subject.scoresRevealed);
                    const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;
                    const grade = getGradeLetter(total, schoolGradingSystem);

                    return (
                      <tr
                        key={subject.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${released ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"}`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                {subject.subject?.name || "Subject"}
                              </p>
                              {!released && (
                                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
                                  Score pending release
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {released ? (subject.assignmentScore != null ? subject.assignmentScore : "—") : <NACell />}
                        </td>

                        <td className="px-5 py-4 text-center text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {released
                            ? ((subject.caScore ?? subject.quizScore) != null ? (subject.caScore ?? subject.quizScore) : "—")
                            : <NACell />}
                        </td>

                        <td className="px-5 py-4 text-center text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {released ? (subject.examScore != null ? subject.examScore : "—") : <NACell />}
                        </td>

                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {released && total != null ? (
                            <span className={`inline-flex items-center justify-center min-w-[3.5rem] px-2.5 py-1 rounded-lg text-xs font-bold ${getScoreColor(total)}`}>
                              {total}
                            </span>
                          ) : (
                            <NACell />
                          )}
                        </td>

                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {released && total != null ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${getScoreColor(total)}`}>
                              {grade}
                            </span>
                          ) : (
                            <span className="text-zinc-400 font-bold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
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

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportPDF}
                className="h-9 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentResultViewPage() {
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
