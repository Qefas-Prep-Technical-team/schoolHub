"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  X,
} from "lucide-react";

export interface PaperAnswerSummary {
  paperId: string;
  paperName: string;
  answeredCount: number;
  totalCount: number;
}

export interface ConfirmSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paperSummaries: PaperAnswerSummary[];
  remainingSeconds: number | null;
  isSubmitting?: boolean;
}

function formatRemainingTime(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "--:--";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export default function ConfirmSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  paperSummaries,
  remainingSeconds,
  isSubmitting = false,
}: ConfirmSubmitModalProps) {
  if (!isOpen) return null;

  const totalQuestions = paperSummaries.reduce(
    (sum, p) => sum + p.totalCount,
    0,
  );
  const totalAnswered = paperSummaries.reduce(
    (sum, p) => sum + p.answeredCount,
    0,
  );
  const unansweredCount = Math.max(0, totalQuestions - totalAnswered);
  const progressPercent =
    totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-submit-title"
      >
        {/* Top Accent Bar */}
        <div
          className={`h-1.5 w-full ${
            unansweredCount > 0
              ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
              : "bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"
          }`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close confirmation dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                unansweredCount > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {unansweredCount > 0 ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div className="pr-6">
              <h2
                id="confirm-submit-title"
                className="text-xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                Confirm Exam Submission
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Please review your progress below before submitting your final
                answers.
              </p>
            </div>
          </div>

          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Questions Answered
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {totalAnswered}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  / {totalQuestions} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    unansweredCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Time Remaining
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white">
                  {formatRemainingTime(remainingSeconds)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Once submitted, you cannot reopen this attempt.
              </p>
            </div>
          </div>

          {/* Paper-by-Paper Breakdown */}
          {paperSummaries.length > 0 && (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Paper Breakdown
              </p>
              {paperSummaries.map((paper) => {
                const paperUnanswered = Math.max(
                  0,
                  paper.totalCount - paper.answeredCount,
                );
                return (
                  <div
                    key={paper.paperId}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                        {paper.paperName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                          paperUnanswered === 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {paper.answeredCount} / {paper.totalCount} Answered
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Warning / Confirmation Callout */}
          {unansweredCount > 0 ? (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="text-xs leading-relaxed">
                <span className="font-black">
                  You have {unansweredCount} unanswered question
                  {unansweredCount !== 1 ? "s" : ""}!
                </span>{" "}
                Are you sure you want to submit without answering all questions?
                Submitted exams are final and cannot be edited.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs leading-relaxed">
                <span className="font-black">All questions answered!</span>{" "}
                Click <strong>Yes, Submit Exam</strong> below to finalize and
                grade your examination.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Go Back & Review
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Yes, Submit Exam</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

