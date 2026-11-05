import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Download,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Building2,
  Copy,
  Check,
  User,
  RefreshCw,
  CheckCheck,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  SignatureSlotInfo,
  StudentTranscriptAccessTier,
  PublishedResultGroup,
} from "../types/transcript.types";
import { TranscriptAvailableRecordsSection } from "./TranscriptAvailableRecordsSection";

interface TranscriptAuditSidebarProps {
  schoolName: string;
  schoolLocation: string;
  studentCode?: string;
  isAuditLoading: boolean;
  onRefreshAudit: () => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  principalSlot: SignatureSlotInfo;
  registrarSlot: SignatureSlotInfo;
  requiresPayment: boolean;
  isCurrentViewUnlocked: boolean;
  effectiveFee: number;
  isFeeLoading?: boolean;
  accessTier: StudentTranscriptAccessTier;
  onOpenClearanceModal: () => void;
  totalTranscriptDownloads: number;
  isGraduated: boolean;
  hasDownloadRemaining: boolean;
  auditData: Record<string, unknown> | null | undefined;
  results?: PublishedResultGroup[];
  isTermUnlocked?: (sessionId: string, term: string) => boolean;
  onSelectTermForClearance?: (sessionId: string, term: string) => void;
}

export function TranscriptAuditSidebar(props: TranscriptAuditSidebarProps) {
  const [showSignatories, setShowSignatories] = useState(false);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  const refHash = `TRX-${props.studentCode?.toUpperCase() || "SCH"}-${new Date().getFullYear()}`;
  const downloadStats = props.auditData?.downloadStats as
    | {
      studentDownloads?: number;
      parentDownloads?: number;
      lastDownloadedAt?: string | null;
    }
    | undefined;

  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5 print:hidden">
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
            Registry Verification
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={props.onRefreshAudit}
            className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-900"
            title="Refresh status"
          >
            <RefreshCw
              size={13}
              className={cn(props.isAuditLoading ? "animate-spin" : "")}
            />
          </Button>
        </div>

        {/* Portal Clearance Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Lock size={13} className="text-blue-600" /> Clearance Status
            </span>
            {props.requiresPayment && !props.isCurrentViewUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                <AlertCircle size={11} /> Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={11} /> Cleared
              </span>
            )}
          </div>

          {props.requiresPayment && !props.isCurrentViewUnlocked ? (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                {props.accessTier === "FREE_TIER_SCHOOL"
                  ? "School on Free Tier. Complete clearance to unlock your official transcript."
                  : props.accessTier === "GRADUATED_ALUMNI"
                    ? "Graduated alumni clearance fee required to release archival records."
                    : "Archival clearance fee required to unlock certified records."}
              </p>
              <Button
                onClick={props.onOpenClearanceModal}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard size={14} />
                <span>{props.isFeeLoading ? "loading..." : `Pay ₦${props.effectiveFee.toLocaleString()}`}</span>
              </Button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CheckCheck size={14} className="text-emerald-600" />
                Active Verified Clearance
              </p>
              <p className="text-[10px] text-slate-500">Official export pass validated.</p>
            </div>
          )}
        </div>

        {/* Section: Available Terminal Records for Download */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
          <TranscriptAvailableRecordsSection
            results={props.results || []}
            isTermUnlocked={props.isTermUnlocked || (() => true)}
            requiresPayment={props.requiresPayment}
            isGraduated={props.isGraduated}
            hasDownloadRemaining={props.hasDownloadRemaining}
            onSelectTermForClearance={props.onSelectTermForClearance || (() => { })}
          />
        </div>

        {/* Download Allowance (Graduated students) */}
        {props.isGraduated && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">Download Limit</span>
              <span className={props.hasDownloadRemaining ? "text-emerald-600" : "text-amber-600"}>
                {props.hasDownloadRemaining ? "1 Copy Remaining" : "Limit Reached"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {props.hasDownloadRemaining ? "One official certified PDF download." : "Clearance required for new copy."}
            </p>
          </div>
        )}

        {/* Collapsible Dropdown: Reference & Signatories */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowSignatories(!showSignatories)}
            className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span>Signatories &amp; Ref Details</span>
            {showSignatories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSignatories && (
            <div className="space-y-3 pt-3 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Hash Code</span>
                  <button
                    onClick={() => props.onCopy(refHash, "transcript reference")}
                    className="text-[10px] text-blue-600 font-bold flex items-center gap-1"
                  >
                    {props.copiedField === "transcript reference" ? <Check size={11} /> : <Copy size={11} />}
                    <span>{props.copiedField === "transcript reference" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">{refHash}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{props.principalSlot.roleTitle}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Signed
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{props.registrarSlot.roleTitle}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Signed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Dropdown: Download Activity Telemetry */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowTelemetryDetails(!showTelemetryDetails)}
            className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span>Download Telemetry ({props.totalTranscriptDownloads})</span>
            {showTelemetryDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTelemetryDetails && (
            <div className="space-y-3 pt-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-[10px] text-indigo-600 font-bold block">Scholar</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {downloadStats?.studentDownloads ?? 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-[10px] text-emerald-600 font-bold block">Guardians</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {downloadStats?.parentDownloads ?? 0}
                  </span>
                </div>
              </div>

              {downloadStats?.lastDownloadedAt && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> Last downloaded {format(new Date(downloadStats.lastDownloadedAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
