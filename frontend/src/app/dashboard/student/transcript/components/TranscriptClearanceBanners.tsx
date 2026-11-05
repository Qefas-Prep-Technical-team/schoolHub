import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Copy,
  Mail,
  Key,
  GraduationCap,
  Building2,
} from "lucide-react";
import {
  DirectAccessPassState,
  StudentTranscriptAccessTier,
  getTermLabel,
} from "../types/transcript.types";

export function TranscriptActivePassBanner({
  directAccessPass,
  availableSessions,
  enrolledClass,
  copiedField,
  isEmailingPass,
  onCopyAccessLink,
  onEmailAccessLink,
}: {
  directAccessPass: DirectAccessPassState;
  availableSessions: Array<{ id: string; name: string }>;
  enrolledClass: string;
  copiedField: string | null;
  isEmailingPass: boolean;
  onCopyAccessLink: () => void;
  onEmailAccessLink: () => void;
}) {
  const sessionLabel =
    directAccessPass.sessionId === "ALL"
      ? "All Sessions"
      : availableSessions.find((s) => s.id === directAccessPass.sessionId)
          ?.name || directAccessPass.sessionId;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-indigo-600/10 border border-emerald-300 dark:border-emerald-800/80 shadow-xs space-y-3 print:hidden animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                Official 30-Day Clearance Pass Active
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                Unlocked via Secure Link
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 truncate">
              Viewing certified records for:{" "}
              <strong>
                {sessionLabel} • {getTermLabel(directAccessPass.term || "ALL")}
              </strong>{" "}
              (Class: <strong>{enrolledClass}</strong>)
              {directAccessPass.expiresAt &&
                ` • Valid until ${format(new Date(directAccessPass.expiresAt), "MMMM d, yyyy")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={onCopyAccessLink}
            className="rounded-xl h-9 text-xs font-bold gap-1.5 flex-1 md:flex-none border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 cursor-pointer"
          >
            <Copy size={13} />
            <span>
              {copiedField === "accessLink"
                ? "Copied Link!"
                : "Copy 30-Day Link"}
            </span>
          </Button>
          <Button
            size="sm"
            onClick={onEmailAccessLink}
            disabled={isEmailingPass}
            className="rounded-xl h-9 text-xs font-bold gap-1.5 flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Mail size={13} />
            <span>{isEmailingPass ? "Sending..." : "Email Link to Me"}</span>
          </Button>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed border-t border-emerald-200/40 dark:border-emerald-900/30 pt-2.5">
        💡 <strong>Access Notice:</strong> You are currently viewing certified
        terminal records unlocked via your secure 30-day clearance pass. To
        access on other devices, bookmark or email this link.
      </p>
    </div>
  );
}

export function TranscriptRecentClearedBanner({
  recentClearancePayments,
  enrolledClass,
  scholarEmail,
  isResendingLink,
  onResendLink,
  onOpenRestoreModal,
}: {
  recentClearancePayments: Array<Record<string, unknown>>;
  enrolledClass: string;
  scholarEmail?: string;
  isResendingLink: boolean;
  onResendLink: (ref?: string) => void;
  onOpenRestoreModal: () => void;
}) {
  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-blue-500/40 shadow-xl space-y-4 print:hidden animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} /> 30-Day Clearance Record Verified
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Lock size={10} /> Dashboard Direct Preview Locked
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Official Transcript Clearance Record on File
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            To preserve institutional certification and prevent unauthorized
            browser caching, certified academic transcripts cannot be previewed
            directly from the student dashboard. Official records can only be
            viewed and exported using your dedicated 30-day link.
          </p>
        </div>
        <Button
          onClick={() => onResendLink()}
          disabled={isResendingLink}
          className="h-12 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs gap-2 shrink-0 shadow-xl shadow-blue-600/30 cursor-pointer"
        >
          <Mail size={16} />
          <span>
            {isResendingLink
              ? "Sending Link..."
              : "Resend Transcript Download & Preview Link"}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {recentClearancePayments.map((p, idx) => {
          const paidDate = p.paidAt || p.createdAt;
          const refStr = String(p.reference || "");
          return (
            <div
              key={String(p.id || refStr || idx)}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
                  Cleared Scope
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Paid & Certified
                </span>
              </div>
              <div>
                <p className="font-black text-sm text-white">
                  {String(p.session || "Academic Session")} •{" "}
                  {p.term ? getTermLabel(String(p.term)) : "All Terms"}
                </p>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">
                  Class: <strong className="text-white">{enrolledClass}</strong>
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Paid:{" "}
                  {paidDate
                    ? format(new Date(String(paidDate)), "dd MMM yyyy")
                    : "Verified"}
                </span>
                <span className="font-mono text-[10px]">
                  Ref: {refStr ? refStr.slice(-6) : "PAID"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-blue-400 shrink-0" />
          <span>
            Preview link will be sent to{" "}
            <strong>{scholarEmail || "your registered email"}</strong>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenRestoreModal}
          className="h-8 px-3 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          Already have access token? Enter manually →
        </Button>
      </div>
    </div>
  );
}

export function TranscriptTierPaywallCard({
  accessTier,
  schoolName,
  effectiveFee,
  isFeeLoading,
  onOpenClearanceModal,
  onOpenRestoreModal,
}: {
  accessTier: StudentTranscriptAccessTier;
  schoolName: string;
  effectiveFee: number;
  isFeeLoading?: boolean;
  onOpenClearanceModal: () => void;
  onOpenRestoreModal: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-10 text-center space-y-4 my-6">
      <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
        {accessTier === "GRADUATED_ALUMNI" ? (
          <GraduationCap size={30} />
        ) : accessTier === "FREE_TIER_SCHOOL" ? (
          <Building2 size={30} />
        ) : (
          <Lock size={30} />
        )}
      </div>
      <div className="space-y-1.5 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
          {accessTier === "GRADUATED_ALUMNI"
            ? "Graduated Alumni Archival Clearance"
            : accessTier === "FREE_TIER_SCHOOL"
              ? "Free-Tier School — Feature Not Included in School Plan"
              : "Institutional Transcript Clearance Required"}
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-1">
          {accessTier === "FREE_TIER_SCHOOL"
            ? "Official Transcript Locked on School Free Tier"
            : "Official Transcript Access Clearance Required"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          {accessTier === "GRADUATED_ALUMNI"
            ? `As a graduated alumnus of ${schoolName}, previewing and downloading certified official transcript records requires an archival clearance fee of ${isFeeLoading ? "loading..." : `₦${effectiveFee.toLocaleString()}`} per academic term (grants a 30-day verified pass and 1 official PDF copy).`
            : accessTier === "FREE_TIER_SCHOOL"
              ? `${schoolName} is currently on the Free Institutional Tier, which does not include complimentary student transcript access. You may unlock your certified transcript directly by completing individual term clearance of ${isFeeLoading ? "loading..." : `₦${effectiveFee.toLocaleString()}`}, or contact your school administration to upgrade the school's platform subscription.`
              : `${schoolName} requires an official session clearance fee of ${isFeeLoading ? "loading..." : `₦${effectiveFee.toLocaleString()}`} per academic term to unlock and export certified transcript records.`}
        </p>
      </div>
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
        <Button
          onClick={onOpenClearanceModal}
          className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <CreditCard size={16} />
          <span>
            {isFeeLoading ? "Loading clearance pricing..." : `Select Term & Pay Clearance (₦${effectiveFee.toLocaleString()})`}
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={onOpenRestoreModal}
          className="h-12 px-5 rounded-2xl border-slate-300 dark:border-zinc-700 font-bold text-xs gap-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Key size={14} />
          <span>Already Paid? Restore 30-Day Access</span>
        </Button>
      </div>
    </div>
  );
}

