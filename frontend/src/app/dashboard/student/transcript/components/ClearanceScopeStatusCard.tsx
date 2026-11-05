import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getTermLabel } from "../types/transcript.types";

interface ClearanceScopeStatusCardProps {
  hasNoData: boolean;
  isGraduated?: boolean;
  sessionId: string;
  sessionName: string;
  term: string;
}

export function ClearanceScopeStatusCard({
  hasNoData,
  isGraduated,
  sessionId,
  sessionName,
  term,
}: ClearanceScopeStatusCardProps) {
  if (hasNoData) {
    return (
      <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-3">
        <AlertCircle size={20} className="text-rose-600 shrink-0" />
        <div>
          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">
            No Academic Results Found for this Scope
          </p>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
            {isGraduated
              ? "Graduated scholars cannot complete clearance on terms without published records."
              : "Clearance payment is disabled until official grades are published for this term."}
          </p>
        </div>
      </div>
    );
  }

  if (sessionId && term) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
            Target Clearance Lock
          </p>
          <p className="text-xs font-black text-slate-900 dark:text-white truncate">
            {sessionName} • {getTermLabel(term)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
      <AlertCircle size={18} className="text-amber-600 shrink-0" />
      <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
        Please select both an academic session and term to enable checkout.
      </p>
    </div>
  );
}

