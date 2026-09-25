"use client";

import { useMyPublishedResults } from "@/lib/api/hooks/useRecords";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, ChevronRight, CheckCircle2, Clock, Eye } from "lucide-react";

function getTermLabel(term: string): string {
  const map: Record<string, string> = { FIRST: "1st Term", SECOND: "2nd Term", THIRD: "3rd Term" };
  return map[term] || term;
}

function getTermGradient(term: string): string {
  const map: Record<string, string> = {
    FIRST:  "from-violet-600 to-indigo-600",
    SECOND: "from-rose-500 to-pink-600",
    THIRD:  "from-amber-500 to-orange-500",
  };
  return map[term] || "from-slate-600 to-slate-700";
}

function getTermAccent(term: string): string {
  const map: Record<string, string> = {
    FIRST:  "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300",
    SECOND: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300",
    THIRD:  "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
  };
  return map[term] || "bg-slate-50 border-slate-200 text-slate-700";
}

function StatusBadge({ subjectCount, revealedCount }: { subjectCount: number; revealedCount: number }) {
  if (revealedCount === subjectCount) {
    // All subjects have grades released
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-full px-2.5 py-1">
        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
        <span>All scores released</span>
      </div>
    );
  }
  if (revealedCount > 0) {
    // Some scores revealed (grades N/A), some fully released
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-full px-2.5 py-1">
        <Eye className="w-3 h-3 flex-shrink-0" />
        <span>{subjectCount - revealedCount > 0 ? `${subjectCount - revealedCount} subject${subjectCount - revealedCount !== 1 ? "s" : ""} hidden` : "Scores pending"}</span>
      </div>
    );
  }
  // All subjects visible but grades all pending (revealed but not released)
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-full px-2.5 py-1">
      <Clock className="w-3 h-3 flex-shrink-0" />
      <span>Scores not yet released</span>
    </div>
  );
}

function ResultGroupCard({ group, idx }: { group: any; idx: number }) {
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
      className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleView}
      role="button"
      tabIndex={0}
      id={`result-group-card-${idx}`}
      onKeyDown={(e) => e.key === "Enter" && handleView()}
    >
      {/* Top gradient strip */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      {/* Card body */}
      <div className="p-5">
        {/* Top row: term badge + chevron */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accentClass}`}>
            {getTermLabel(group.term)}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
        </div>

        {/* Class name */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
          {group.class?.name || "Class"}
        </h2>

        {/* Session */}
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
          {group.session?.name || "—"}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{subjectCount}</span>
            <span>subject{subjectCount !== 1 ? "s" : ""}</span>
          </div>

          <StatusBadge subjectCount={subjectCount} revealedCount={revealedCount} />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {revealedCount === subjectCount ? "Full results available" : "View subject details"}
        </span>
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Result <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}

export default function StudentResultListPage() {
  const { data: results = [], isLoading } = useMyPublishedResults();

  if (isLoading) {
    return (
      <div className="w-[95%] mx-auto py-8 space-y-5">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-5 w-80 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-[95%] mx-auto py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Academic Results</h1>
        <p className="text-slate-500 mb-10">Your official term results will appear here once published.</p>
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No Results Yet</h2>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Your school hasn&apos;t published any final results for you yet. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Results</h1>
        </div>
        <p className="text-slate-500 ml-12">
          {(results as any[]).length} result group{(results as any[]).length !== 1 ? "s" : ""} — select one to view your result sheet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {(results as any[]).map((group: any, idx: number) => (
          <ResultGroupCard key={`${group.sessionId}-${group.term}-${idx}`} group={group} idx={idx} />
        ))}
      </div>
    </div>
  );
}
