import React from "react";
import { Lock, ShieldAlert, Award } from "lucide-react";
import { SignatureSlotInfo } from "../types/transcript.types";

interface TranscriptSignaturesFooterProps {
  registrarSlot: SignatureSlotInfo;
  principalSlot: SignatureSlotInfo;
  isLocked?: boolean;
  isGraduated?: boolean;
  transcriptFee?: number;
  isFeeLoading?: boolean;
  onUnlockClick?: () => void;
}

export function TranscriptSignaturesFooter({
  registrarSlot,
  principalSlot,
  isLocked = false,
  isGraduated = false,
  transcriptFee = 1000,
  isFeeLoading,
  onUnlockClick,
}: TranscriptSignaturesFooterProps) {
  return (
    <div className="pt-8 border-t-2 border-slate-200 dark:border-zinc-800 space-y-6 relative">
      {isLocked && (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-2 border-amber-300 dark:border-amber-700/60 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Lock size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <ShieldAlert size={11} />
                {isGraduated ? "Graduate Archival Requirement" : "Institutional Clearance Required"}
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Official Signatures &amp; Registrar Seal Locked
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 max-w-xl">
                {isGraduated
                  ? `Notice for Graduated Scholar: As a graduated student, institutional clearance of ${isFeeLoading ? "loading..." : `₦${transcriptFee.toLocaleString()}`} is required to unlock official digital endorsements, registrar signatures, and embossed institutional seal on your graduate academic transcript.`
                  : `Portal session clearance of ${isFeeLoading ? "loading..." : `₦${transcriptFee.toLocaleString()}`} is required before official electronic signatories and registry seal can be certified for export.`}
              </p>
            </div>
          </div>

          {onUnlockClick && (
            <button
              type="button"
              onClick={onUnlockClick}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Lock size={13} />
              <span>{isFeeLoading ? "Loading pricing..." : isGraduated ? `Pay Graduate Clearance (₦${transcriptFee.toLocaleString()})` : `Pay ₦${transcriptFee.toLocaleString()} to Clear Signatures`}</span>
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-center sm:text-left transition-all duration-300 ${isLocked
            ? "opacity-20 select-none pointer-events-none filter blur-[8px] sm:blur-[10px]"
            : ""
            }`}
        >
          <div className="space-y-3">
            <div className="h-24 sm:h-28 flex items-end justify-center sm:justify-start pb-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 w-full relative">
              {registrarSlot.signatureUrl && registrarSlot.isImage ? (
                <img
                  src={registrarSlot.signatureUrl}
                  alt={registrarSlot.roleTitle}
                  className="h-20 sm:h-24 max-w-[220px] object-contain dark:invert select-none"
                />
              ) : (
                <span className="font-['Caveat',cursive] italic text-2xl sm:text-3xl font-bold text-slate-800 dark:text-zinc-100 pb-1">
                  {registrarSlot.signatureUrl ||
                    registrarSlot.adminName ||
                    "Registrar"}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {registrarSlot.roleTitle}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {registrarSlot.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400 dark:border-blue-600 flex items-center justify-center text-center p-2 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
              Official Electronic Seal
            </div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              Certified Verified Copy
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-right">
            <div className="h-24 sm:h-28 flex items-end justify-center sm:justify-end pb-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 w-full relative">
              {principalSlot.signatureUrl && principalSlot.isImage ? (
                <img
                  src={principalSlot.signatureUrl}
                  alt={principalSlot.roleTitle}
                  className="h-20 sm:h-24 max-w-[220px] object-contain dark:invert select-none"
                />
              ) : (
                <span className="font-['Caveat',cursive] italic text-3xl sm:text-4xl font-bold text-slate-800 dark:text-zinc-100 pb-1">
                  {principalSlot.signatureUrl ||
                    principalSlot.adminName ||
                    "Authorized Signature"}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {principalSlot.roleTitle}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {principalSlot.subtitle}
              </p>
            </div>
          </div>
        </div>

        {isLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/75 dark:bg-zinc-900/85 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center gap-2">
              <Lock size={14} className="text-amber-400" />
              <span className="text-[11px] font-bold tracking-wide">
                Institutional Endorsements &amp; Registrar Seal Obscured
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-400 dark:text-zinc-500 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
        This certified academic credential was generated electronically via
        Qefas Hub Academic Management System. Any alteration, erasure, or
        unauthorized duplication invalidates this document.
      </div>
    </div>
  );
}

