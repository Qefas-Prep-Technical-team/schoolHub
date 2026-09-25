"use client";

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
} from "lucide-react";

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
    FIRST:  "from-violet-600 to-indigo-600",
    SECOND: "from-rose-500 to-pink-600",
    THIRD:  "from-amber-500 to-orange-500",
  };
  return map[term] || "from-slate-600 to-slate-700";
}

function getScoreColor(total: number | null): string {
  if (total == null) return "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500";
  if (total >= 70) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (total >= 50) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
  if (total >= 40) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
}

function getGradeLetter(total: number | null): string {
  if (total == null) return "—";
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

function NACell() {
  return (
    <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-600 text-xs italic">
      <Lock className="w-3 h-3" />N/A
    </span>
  );
}

function ResultViewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId") ?? "";
  const term      = searchParams.get("term") ?? "";

  const { data: results = [], isLoading } = useMyPublishedResults();

  if (isLoading) {
    return (
      <div className="w-[95%] mx-auto py-8 space-y-5">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const group = (results as any[]).find(
    (g: any) => g.sessionId === sessionId && g.term === term
  );

  if (!group) {
    return (
      <div className="w-[95%] mx-auto py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Results
        </button>
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Result Not Found</h2>
          <p className="text-slate-400 text-sm">
            This result is not available yet, or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  const { subjectCount, revealedCount } = group;
  const subjectResults: any[] = group.subjectResults ?? [];
  const gradient = getTermGradient(group.term);

  // Stats only from subjects with released scores
  const releasedSubjects = subjectResults.filter((s: any) => s.scoresRevealed);
  const totals = releasedSubjects.map((s: any) => Number(s.totalScore ?? 0)).filter((n: number) => !isNaN(n));
  const avg     = totals.length > 0 ? totals.reduce((a: number, b: number) => a + b, 0) / totals.length : null;
  const highest = totals.length > 0 ? Math.max(...totals) : null;
  const lowest  = totals.length > 0 ? Math.min(...totals) : null;

  // Status badge for the hero
  const allReleased = revealedCount === subjectCount;
  const someReleased = revealedCount > 0 && revealedCount < subjectCount;
  const noneReleased = revealedCount === 0;

  return (
    <div className="w-[95%] mx-auto py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Results
      </button>

      {/* Hero header */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 md:p-8 text-white mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                  {getTermLabel(group.term)}
                </span>
                <span className="opacity-40">•</span>
                <span className="text-xs font-medium opacity-80">{group.session?.name || "—"}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mt-1 leading-tight">
                {group.class?.name || "Class"}
              </h1>
              <p className="text-sm opacity-70 mt-0.5">
                {subjectCount} Subject{subjectCount !== 1 ? "s" : ""}
                {someReleased && ` · ${revealedCount} score${revealedCount !== 1 ? "s" : ""} released`}
              </p>
            </div>
          </div>

          {/* Summary stats — only released subjects */}
          {allReleased && avg != null ? (
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Average</p>
                <p className="text-2xl font-black">{avg.toFixed(1)}%</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Highest</p>
                <p className="text-2xl font-black">{highest}</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Lowest</p>
                <p className="text-2xl font-black">{lowest}</p>
              </div>
            </div>
          ) : noneReleased ? (
            <div className="bg-white/20 rounded-xl px-5 py-4 flex items-center gap-3 max-w-xs">
              <Eye className="w-5 h-5 opacity-80 flex-shrink-0" />
              <p className="text-sm font-medium">
                Subjects are visible but scores are not yet released by your school.
              </p>
            </div>
          ) : someReleased && avg != null ? (
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Released Avg</p>
                <p className="text-2xl font-black">{avg.toFixed(1)}%</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Released</p>
                <p className="text-2xl font-black">{revealedCount}/{subjectCount}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Info banners */}
      {noneReleased && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-5 py-4 text-amber-800 dark:text-amber-300">
          <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Scores not yet released</p>
            <p className="text-sm opacity-80 mt-0.5">
              Your subjects are visible but your scores are still being finalised by your school. Check back later.
            </p>
          </div>
        </div>
      )}
      {someReleased && (
        <div className="mb-6 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl px-5 py-4 text-blue-800 dark:text-blue-300">
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Partial results released</p>
            <p className="text-sm opacity-80 mt-0.5">
              {revealedCount} of {subjectCount} subject score{revealedCount !== 1 ? "s" : ""} have been released. Remaining scores show N/A until your school releases them.
            </p>
          </div>
        </div>
      )}

      {/* Subject results table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-slate-800 dark:text-slate-200">Subject Scores</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assignment</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">CA / Quiz</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Exam</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {subjectResults.map((subject: any) => {
                const released = subject.scoresRevealed as boolean;
                const total = released && subject.totalScore != null ? Number(subject.totalScore) : null;

                return (
                  <tr
                    key={subject.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Subject name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${released ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-slate-50 dark:bg-slate-800"}`}>
                          <BookOpen className={`w-4 h-4 ${released ? "text-indigo-500" : "text-slate-400"}`} />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {subject.subject?.name || "Subject"}
                        </span>
                        {!released && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assignment */}
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                      {released ? (subject.assignmentScore != null ? subject.assignmentScore : "—") : <NACell />}
                    </td>

                    {/* CA / Quiz */}
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                      {released
                        ? ((subject.caScore ?? subject.quizScore) != null ? (subject.caScore ?? subject.quizScore) : "—")
                        : <NACell />}
                    </td>

                    {/* Exam */}
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                      {released ? (subject.examScore != null ? subject.examScore : "—") : <NACell />}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 text-center">
                      {released ? (
                        <span className={`inline-flex items-center justify-center min-w-[3.5rem] px-3 py-1.5 rounded-lg text-sm font-bold ${getScoreColor(total)}`}>
                          {total != null ? total : "—"}
                        </span>
                      ) : (
                        <NACell />
                      )}
                    </td>

                    {/* Grade */}
                    <td className="px-6 py-4 text-center">
                      {released ? (
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-black ${getScoreColor(total)}`}>
                          {getGradeLetter(total)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {subjectResults.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-400 italic">
                    No subjects available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary — only show if at least some scores are released */}
        {releasedSubjects.length > 0 && (
          <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-slate-500">Average:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {avg != null ? `${avg.toFixed(1)}%` : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-slate-500">Highest:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{highest ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-slate-500">Released Subjects:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {revealedCount} / {subjectCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentResultViewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-[95%] mx-auto py-8 space-y-5">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <ResultViewInner />
    </Suspense>
  );
}
