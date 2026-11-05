import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GradingRule } from "@/utils/gradingSystem";
import {
  Lock,
  ShieldCheck,
  Calendar,
  CreditCard,
  Mail,
  Key,
} from "lucide-react";
import {
  PublishedResultGroup,
  getTermLabel,
  getGradeLetter,
  getGradePoint,
  getRemark,
  getGradeBadgeClass,
} from "../types/transcript.types";

interface TranscriptTermCourseCardProps {
  sessionId: string;
  sessionName: string;
  termGroup: PublishedResultGroup;
  termIdx: number;
  requiresPayment: boolean;
  isThisTermUnlocked: boolean;
  matchingClearedPayment: Record<string, unknown> | undefined;
  effectiveFee: number;
  isFeeLoading?: boolean;
  isResendingLink: boolean;
  gradingSystem: GradingRule[] | null | undefined;
  onResendLink: (ref?: string) => void;
  onSelectTermForClearance: (sessionId: string, term: string) => void;
  onOpenRestoreModal: () => void;
}

export function TranscriptTermCourseCard({
  sessionId,
  sessionName,
  termGroup,
  termIdx,
  requiresPayment,
  isThisTermUnlocked,
  matchingClearedPayment,
  effectiveFee,
  isFeeLoading,
  isResendingLink,
  gradingSystem,
  onResendLink,
  onSelectTermForClearance,
  onOpenRestoreModal,
}: TranscriptTermCourseCardProps) {
  const subjects = termGroup.subjectResults || [];
  const termLabel = getTermLabel(termGroup.term);
  const revealedCount = termGroup.revealedCount || 0;
  const totalSubjects = termGroup.subjectCount || subjects.length;

  let termMarksSum = 0;
  let termPointsSum = 0;
  let termScoredCount = 0;
  subjects.forEach((s) => {
    const effectiveTotal =
      s.totalScore ??
      (s.assignmentScore != null ||
        s.quizScore != null ||
        s.caScore != null ||
        s.examScore != null
        ? (s.assignmentScore || 0) +
        (s.quizScore || 0) +
        (s.caScore || 0) +
        (s.examScore || 0)
        : null);
    if (s.scoresRevealed && effectiveTotal != null) {
      termMarksSum += effectiveTotal;
      termPointsSum += getGradePoint(effectiveTotal, gradingSystem);
      termScoredCount++;
    }
  });

  const termGpa =
    termScoredCount > 0 ? (termPointsSum / termScoredCount).toFixed(2) : "0.00";
  const termAvg =
    termScoredCount > 0 ? Math.round(termMarksSum / termScoredCount) : 0;
  const isLocked = requiresPayment && !isThisTermUnlocked;

  return (
    <div
      key={`${sessionId}-${termGroup.term}-${termIdx}`}
      className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs"
    >
      <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>{termLabel}</span>
            {isLocked && <Lock size={11} className="text-amber-300" />}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            {termGroup.class?.name || "Class Cohort"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
            <span>Term GPA:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {isLocked ? "••••" : termGpa}
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
            <span>Average:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {isLocked ? "••••" : `${termAvg}%`}
            </span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-slate-500">
            <span>Scores:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {isLocked
                ? "Clearance Req."
                : `${revealedCount}/${totalSubjects}`}
            </span>
          </div>
        </div>
      </div>

      {isLocked ? (
        <div className="p-6 sm:p-8 text-center bg-slate-50/70 dark:bg-zinc-900/40 rounded-b-2xl border-t border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            {matchingClearedPayment ? (
              <ShieldCheck size={22} />
            ) : (
              <Lock size={22} />
            )}
          </div>
          <h4 className="font-black text-sm text-slate-900 dark:text-white">
            {matchingClearedPayment
              ? `${termLabel} Cleared & Ready via Email Pass`
              : `${termLabel} Scores Locked (${sessionName})`}
          </h4>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            {matchingClearedPayment
              ? `Cleared on ${format(new Date(String(matchingClearedPayment.paidAt || matchingClearedPayment.createdAt)), "dd MMM yyyy")}. Use your 30-day email pass to preview.`
              : `Terminal academic records for ${termLabel} are locked pending clearance.`}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 print:hidden">
            {matchingClearedPayment ? (
              <Button
                size="sm"
                onClick={() =>
                  onResendLink(String(matchingClearedPayment.reference || ""))
                }
                disabled={isResendingLink}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-1.5"
              >
                <Mail size={14} />
                <span>Resend 30-Day Link</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  onSelectTermForClearance(sessionId, termGroup.term)
                }
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-1.5"
              >
                <CreditCard size={14} />
                <span>
                  {isFeeLoading
                    ? "Loading pricing..."
                    : `Pay ₦${effectiveFee.toLocaleString()} to Unlock ${termLabel}`}
                </span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenRestoreModal}
              className="h-10 px-3.5 rounded-xl text-xs font-bold gap-1"
            >
              <Key size={13} />
              <span>Enter Pass Token</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 w-20">Code</th>
                <th className="py-2.5 px-4">Course / Subject</th>
                <th className="py-2.5 px-3 text-center">Asst</th>
                <th className="py-2.5 px-3 text-center">Quiz</th>
                <th className="py-2.5 px-3 text-center">CA</th>
                <th className="py-2.5 px-3 text-center">Exam</th>
                <th className="py-2.5 px-3 text-center font-black">Total</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-center">GP</th>
                <th className="py-2.5 px-4 text-right">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {subjects.map((sub, sIdx) => {
                const isRevealed = Boolean(sub.scoresRevealed);
                const effectiveTotal =
                  sub.totalScore ??
                  (sub.assignmentScore != null ||
                    sub.quizScore != null ||
                    sub.caScore != null ||
                    sub.examScore != null
                    ? (sub.assignmentScore || 0) +
                    (sub.quizScore || 0) +
                    (sub.caScore || 0) +
                    (sub.examScore || 0)
                    : null);
                const grade = isRevealed
                  ? getGradeLetter(effectiveTotal ?? null, gradingSystem)
                  : "—";
                return (
                  <tr
                    key={sub.id || sIdx}
                    className={
                      sIdx % 2 === 1
                        ? "bg-slate-50/50 dark:bg-zinc-900/30"
                        : "bg-white dark:bg-zinc-950"
                    }
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      {sub.subject?.code || "SUB"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                      {sub.subject?.name || "Subject"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {isRevealed && sub.assignmentScore != null
                        ? sub.assignmentScore
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {isRevealed && sub.quizScore != null
                        ? sub.quizScore
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {isRevealed && sub.caScore != null ? sub.caScore : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {isRevealed && sub.examScore != null
                        ? sub.examScore
                        : "—"}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white">
                      {isRevealed && effectiveTotal != null
                        ? `${effectiveTotal}%`
                        : "Pending"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isRevealed && grade !== "—" ? (
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border",
                            getGradeBadgeClass(grade),
                          )}
                        >
                          {grade}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      {isRevealed
                        ? getGradePoint(
                          effectiveTotal ?? null,
                          gradingSystem,
                        ).toFixed(1)
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {isRevealed
                        ? getRemark(effectiveTotal ?? null, gradingSystem)
                        : "Pending"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

