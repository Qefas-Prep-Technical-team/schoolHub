"use client";

import { useState, useMemo, useEffect } from "react";
import { useMyPublishedResults } from "@/lib/api/hooks/useRecords";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  GraduationCap, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Calendar, 
  Search, 
  LayoutGrid, 
  List, 
  Award, 
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";
import { cn } from "@/lib/utils";

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
  subjectResults?: Array<{
    id?: string;
    subjectName?: string;
    scoresRevealed?: boolean;
    totalScore?: number | null;
  }>;
}

function getTermLabel(term: string): string {
  const map: Record<string, string> = { FIRST: "1st Term", SECOND: "2nd Term", THIRD: "3rd Term" };
  return map[term] || term;
}

function getTermGradient(term: string): string {
  const map: Record<string, string> = {
    FIRST:  "from-violet-600 to-indigo-600",
    SECOND: "from-pink-500 via-rose-500 to-pink-600",
    THIRD:  "from-amber-500 to-orange-500",
  };
  return map[term] || "from-zinc-600 to-zinc-700";
}

function getTermAccent(term: string): string {
  const map: Record<string, string> = {
    FIRST:  "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300",
    SECOND: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-300",
    THIRD:  "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  };
  return map[term] || "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300";
}

function StatusBadge({ subjectCount, revealedCount }: { subjectCount: number; revealedCount: number }) {
  if (revealedCount === subjectCount) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-full px-2.5 py-1">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>All scores released</span>
      </div>
    );
  }
  if (revealedCount > 0) {
    const hiddenCount = subjectCount - revealedCount;
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 rounded-full px-2.5 py-1">
        <Eye className="w-3.5 h-3.5 shrink-0" />
        <span>{hiddenCount > 0 ? `${hiddenCount} subject${hiddenCount !== 1 ? "s" : ""} hidden` : "Scores pending"}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-full px-2.5 py-1">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>Scores pending release</span>
    </div>
  );
}

function ResultGroupCard({ group, idx }: { group: PublishedResultGroup; idx: number }) {
  const router = useRouter();
  const { subjectCount, revealedCount } = group;
  const gradient = getTermGradient(group.term);
  const accentClass = getTermAccent(group.term);

  const handleView = () => {
    const params = new URLSearchParams({ sessionId: group.sessionId, term: group.term });
    router.push(`/dashboard/student/result/termly/view?${params.toString()}`);
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-lg hover:border-pink-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={handleView}
      role="button"
      tabIndex={0}
      id={`result-group-card-${idx}`}
      onKeyDown={(e) => e.key === "Enter" && handleView()}
    >
      {/* Top gradient strip */}
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />

      {/* Card body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top row: term badge + chevron */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accentClass}`}>
              {getTermLabel(group.term)}
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10 transition-colors">
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
            </div>
          </div>

          {/* Class name */}
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-tight mb-1">
            {group.class?.name || "Class Cohort"}
          </h2>

          {/* Session */}
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{group.session?.name || "Academic Session"}</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2.5 flex-wrap pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <div className="w-6 h-6 rounded-md bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{subjectCount}</span>
            <span>subject{subjectCount !== 1 ? "s" : ""}</span>
          </div>

          <StatusBadge subjectCount={subjectCount} revealedCount={revealedCount} />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 flex items-center justify-between text-xs sm:text-sm">
        <span className="text-zinc-500 dark:text-zinc-400 truncate mr-2">
          {revealedCount === subjectCount ? "Full score sheet ready" : "Subject breakdown available"}
        </span>
        <span className="font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
          View Result <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}

export default function StudentResultListPage() {
  const router = useRouter();
  const { data: rawResults, isLoading } = useMyPublishedResults();
  const results = (rawResults as PublishedResultGroup[] | undefined) || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Default to grid on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);

  // Filtered results
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return results;
    const q = searchQuery.toLowerCase();
    return results.filter((group) => {
      const className = group.class?.name?.toLowerCase() || "";
      const sessionName = group.session?.name?.toLowerCase() || "";
      const termName = group.term?.toLowerCase() || "";
      const termLabel = getTermLabel(group.term).toLowerCase();
      return className.includes(q) || sessionName.includes(q) || termName.includes(q) || termLabel.includes(q);
    });
  }, [results, searchQuery]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalTerms = results.length;
    const totalSubjects = results.reduce((acc, curr) => acc + (curr.subjectCount || 0), 0);
    const fullyReleasedTerms = results.filter((r) => r.revealedCount === r.subjectCount && r.subjectCount > 0).length;
    const latestSession = results[0]?.session?.name || "Current";

    return { totalTerms, totalSubjects, fullyReleasedTerms, latestSession };
  }, [results]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-60 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Academic Termly Results
                </h1>
                <HeaderTooltip 
                  content="Official published report cards and termly grade statements released by your school administration. Browse your enrolled terms to review subject papers, continuous assessments, examination scores, and final letter grades."
                />
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Official statement of results published across your academic school terms.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center mb-4 text-pink-600 dark:text-pink-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">No Published Results Yet</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
            Your school has not yet published any termly report cards for your account. Once teachers and administrators finalize term grades, they will appear right here.
          </p>
          <Button 
            asChild
            className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs sm:text-sm px-5 h-10 shadow-sm"
          >
            <Link href="/dashboard/student/grades">
              Go to Grades Overview
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Academic Termly Results
              </h1>
              <HeaderTooltip 
                content="Official published report cards and termly grade statements released by your school administration. Browse your enrolled terms to review subject papers, continuous assessments, examination scores, and final letter grades."
              />
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {results.length} published term result{results.length !== 1 ? "s" : ""} available — select any term to inspect your full score sheet.
            </p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-9 sm:h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold text-xs sm:text-sm self-start sm:self-auto"
        >
          <Link href="/dashboard/student/grades">
            <BarChart3 className="w-4 h-4 mr-2 text-pink-500" />
            <span>Grades Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Quick Summary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-3.5 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5 truncate">Published Terms</p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summaryMetrics.totalTerms}</p>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-3.5 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5 truncate">Total Subjects</p>
            <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summaryMetrics.totalSubjects}</p>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-3.5 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5 truncate">Fully Released</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summaryMetrics.fullyReleasedTerms} <span className="text-xs text-zinc-400 font-normal">/ {summaryMetrics.totalTerms}</span></p>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-3.5 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5 truncate">Academic Session</p>
            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">{summaryMetrics.latestSession}</p>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input 
            type="text" 
            placeholder="Search by class, academic session, or term..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-xs sm:text-sm focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={cn(
              "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            aria-label="Table view"
            className={cn(
              "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              viewMode === "table"
                ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filteredResults.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No matching termly results found</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try adjusting your search criteria or clear the query.</p>
          <Button 
            variant="ghost" 
            onClick={() => setSearchQuery("")}
            className="mt-4 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl"
          >
            Clear Search Filter
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredResults.map((group, idx) => (
            <ResultGroupCard key={`${group.sessionId}-${group.term}-${idx}`} group={group} idx={idx} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-4">Academic Session</th>
                  <th className="px-5 py-4">Class Cohort</th>
                  <th className="px-5 py-4">Term</th>
                  <th className="px-5 py-4 text-center">Evaluated Subjects</th>
                  <th className="px-5 py-4 text-center">Release Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                {filteredResults.map((group, idx) => {
                  const accentClass = getTermAccent(group.term);
                  const handleView = () => {
                    const params = new URLSearchParams({ sessionId: group.sessionId, term: group.term });
                    router.push(`/dashboard/student/result/termly/view?${params.toString()}`);
                  };

                  return (
                    <tr 
                      key={`${group.sessionId}-${group.term}-${idx}`}
                      onClick={handleView}
                      className="hover:bg-pink-50/40 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4 text-zinc-900 dark:text-zinc-100 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{group.session?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-800 dark:text-zinc-200 whitespace-nowrap group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors font-semibold">
                        {group.class?.name || "Class"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${accentClass}`}>
                          {getTermLabel(group.term)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{group.subjectCount}</span> subjects
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          <StatusBadge subjectCount={group.subjectCount} revealedCount={group.revealedCount} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400 group-hover:gap-1.5 transition-all text-xs sm:text-sm">
                          View Sheet <ChevronRight className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
