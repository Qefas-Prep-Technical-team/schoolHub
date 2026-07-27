"use client";

import { CheckCircle2, XCircle, Loader2, FileText, ShieldCheck } from "lucide-react";

export type PaperSubmitStatus = "pending" | "submitting" | "done" | "error";

export interface PaperSubmitState {
  paperId: string;
  paperName: string;
  questionCount: number;
  status: PaperSubmitStatus;
  errorMessage?: string;
}

export interface SubmissionProgressModalProps {
  isOpen: boolean;
  papers: PaperSubmitState[];
  finaliseStatus: "idle" | "finalising" | "done" | "error";
  finaliseError?: string;
}

type AnyStatus = PaperSubmitStatus | "finalising" | "done" | "error";

function StepIcon({ status }: { status: AnyStatus }) {
  if (status === "submitting" || status === "finalising") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-400/30">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/30 animate-in zoom-in-50 duration-300">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-400/30 animate-in zoom-in-50 duration-300">
        <XCircle className="h-4 w-4 text-red-400" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800/60 border border-slate-600/40">
      <span className="h-2 w-2 rounded-full bg-slate-500" />
    </span>
  );
}

export default function SubmissionProgressModal({
  isOpen,
  papers,
  finaliseStatus,
  finaliseError,
}: SubmissionProgressModalProps) {
  if (!isOpen) return null;

  const submittedCount = papers.filter((p) => p.status === "done").length;
  const hasError = papers.some((p) => p.status === "error") || finaliseStatus === "error";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-400">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      {/* Modal card */}
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-400"
        style={{ background: "linear-gradient(145deg, rgba(15,20,40,0.97) 0%, rgba(20,15,50,0.97) 100%)" }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-80" />

        <div className="p-7 space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/5 text-indigo-300 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={13} />
              Secure Submission
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-2">
              {hasError
                ? "Submission Interrupted"
                : finaliseStatus === "done"
                ? "Submission Complete!"
                : "Submitting Examination"}
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              {hasError
                ? "An error occurred. Please check below."
                : finaliseStatus === "done"
                ? "All papers have been securely recorded."
                : `Submitting ${submittedCount} of ${papers.length} subject paper${papers.length !== 1 ? "s" : ""}...`}
            </p>
          </div>

          {/* Progress bar */}
          {!hasError && papers.length > 0 && (
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                style={{ width: `${(submittedCount / papers.length) * 100}%` }}
              />
            </div>
          )}

          {/* Paper list */}
          <div className="space-y-3">
            {papers.map((paper) => (
              <div
                key={paper.paperId}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                  paper.status === "submitting"
                    ? "border-indigo-400/30 bg-indigo-500/5"
                    : paper.status === "done"
                    ? "border-emerald-400/20 bg-emerald-500/5"
                    : paper.status === "error"
                    ? "border-red-400/20 bg-red-500/5"
                    : "border-slate-700/50 bg-slate-800/30"
                }`}
              >
                <StepIcon status={paper.status} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText size={12} className="shrink-0 text-slate-500" />
                    <p
                      className={`text-sm font-bold truncate ${
                        paper.status === "done"
                          ? "text-emerald-300"
                          : paper.status === "error"
                          ? "text-red-300"
                          : paper.status === "submitting"
                          ? "text-indigo-200"
                          : "text-slate-400"
                      }`}
                    >
                      {paper.paperName}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {paper.questionCount} question{paper.questionCount !== 1 ? "s" : ""}
                    {paper.status === "submitting" && " \u2014 submitting..."}
                    {paper.status === "done" && " \u2014 submitted"}
                    {paper.status === "error" && ` \u2014 ${paper.errorMessage ?? "failed"}`}
                  </p>
                </div>

                {paper.status === "submitting" && (
                  <span className="shrink-0 text-[10px] font-black uppercase text-indigo-400 animate-pulse">
                    ACTIVE
                  </span>
                )}
                {paper.status === "done" && (
                  <span className="shrink-0 text-[10px] font-black uppercase text-emerald-400">DONE</span>
                )}
              </div>
            ))}

            {/* Finalising step */}
            {finaliseStatus !== "idle" && (
              <div
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                  finaliseStatus === "finalising"
                    ? "border-violet-400/30 bg-violet-500/5"
                    : finaliseStatus === "done"
                    ? "border-emerald-400/20 bg-emerald-500/5"
                    : "border-red-400/20 bg-red-500/5"
                }`}
              >
                <StepIcon status={finaliseStatus} />
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      finaliseStatus === "done"
                        ? "text-emerald-300"
                        : finaliseStatus === "error"
                        ? "text-red-300"
                        : "text-violet-200"
                    }`}
                  >
                    Finalising &amp; Scoring
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {finaliseStatus === "finalising" && "Recording all results..."}
                    {finaliseStatus === "done" && "All results recorded"}
                    {finaliseStatus === "error" && (finaliseError ?? "Finalisation failed")}
                  </p>
                </div>
                {finaliseStatus === "finalising" && (
                  <span className="shrink-0 text-[10px] font-black uppercase text-violet-400 animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!hasError && finaliseStatus !== "done" && (
            <p className="text-center text-[10px] text-slate-600 font-medium">
              Do not close or navigate away from this page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
