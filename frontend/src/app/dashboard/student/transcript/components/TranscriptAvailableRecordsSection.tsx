import React from "react";
import { format } from "date-fns";
import {
  FileText,
  Calendar,
  CheckCircle2,
  Lock,
  Download,
  AlertCircle,
} from "lucide-react";
import { PublishedResultGroup, getTermLabel } from "../types/transcript.types";

interface TranscriptAvailableRecordsSectionProps {
  results: PublishedResultGroup[];
  isTermUnlocked: (sessionId: string, term: string) => boolean;
  requiresPayment: boolean;
  isGraduated: boolean;
  hasDownloadRemaining: boolean;
  onSelectTermForClearance: (sessionId: string, term: string) => void;
  onDownloadScope?: (sessionId: string, term: string) => void;
}

export function TranscriptAvailableRecordsSection({
  results,
  isTermUnlocked,
  requiresPayment,
  isGraduated,
  hasDownloadRemaining,
  onSelectTermForClearance,
  onDownloadScope,
}: TranscriptAvailableRecordsSectionProps) {
  if (results.length === 0) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-center space-y-1">
        <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
          No Published Records Found
        </p>
        <p className="text-[10px] text-slate-400">
          {isGraduated
            ? "Your account is registered as a Graduate. Once your institution publishes certified terminal score sheets, they will appear here."
            : "Once your school publishes certified terminal score sheets, they will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <FileText size={13} className="text-blue-600" /> Available Terminal Records
        </span>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
          {results.length} {results.length === 1 ? "term" : "terms"}
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {results.map((r, idx) => {
          const sId = r.sessionId || "current";
          const sName = r.session?.name || "Session";
          const tLabel = getTermLabel(r.term);
          const unlocked = !requiresPayment || isTermUnlocked(sId, r.term);

          return (
            <div
              key={`${sId}-${r.term}-${idx}`}
              className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-2.5 text-xs"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {sName} • {tLabel}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {r.subjectCount} {r.subjectCount === 1 ? "course subject" : "course subjects"}
                </p>
              </div>

              {unlocked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold shrink-0 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={11} /> Unlocked
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectTermForClearance(sId, r.term)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black shrink-0 shadow-xs cursor-pointer"
                >
                  <Lock size={10} /> Unlock
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

