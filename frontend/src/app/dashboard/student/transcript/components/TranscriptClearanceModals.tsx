import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  CheckCheck,
} from "lucide-react";
import { getTermLabel, PublishedResultGroup } from "../types/transcript.types";
import { TranscriptRestoreModal } from "./TranscriptRestoreModal";
import { ClearanceTermSelector } from "./ClearanceTermSelector";
import { ClearanceScopeStatusCard } from "./ClearanceScopeStatusCard";

interface TranscriptClearanceModalsProps {
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  schoolName: string;
  studentName?: string;
  studentCode?: string;
  availableSessions: Array<{ id: string; name: string }>;
  paymentTargetSessionId: string;
  setPaymentTargetSessionId: (val: string) => void;
  paymentTargetTerm: string;
  setPaymentTargetTerm: (val: string) => void;
  effectiveFee: number;
  isFeeLoading?: boolean;
  isPayingOnline: boolean;
  onInitiateOnlinePayment: () => void;
  isRestoreModalOpen: boolean;
  setIsRestoreModalOpen: (open: boolean) => void;
  restoreInput: string;
  setRestoreInput: (val: string) => void;
  isRestoring: boolean;
  onRestoreAccess: () => void;
  results?: PublishedResultGroup[];
  isGraduated?: boolean;
}

export function TranscriptClearanceModals(props: TranscriptClearanceModalsProps) {
  const sessionName =
    props.availableSessions.find((s) => s.id === props.paymentTargetSessionId)
      ?.name || "Session";

  const targetRecordsCount = useMemo(() => {
    if (!props.results) return 1;
    return props.results.filter((r) => {
      const matchSession =
        !props.paymentTargetSessionId ||
        r.sessionId === props.paymentTargetSessionId ||
        r.session?.id === props.paymentTargetSessionId ||
        r.session?.name === props.paymentTargetSessionId;
      const matchTerm =
        !props.paymentTargetTerm || r.term === props.paymentTargetTerm;
      return matchSession && matchTerm;
    }).length;
  }, [props.results, props.paymentTargetSessionId, props.paymentTargetTerm]);

  const hasNoData =
    Boolean(props.paymentTargetSessionId) &&
    Boolean(props.paymentTargetTerm) &&
    targetRecordsCount === 0;

  return (
    <>
      <Dialog
        open={props.isPaymentModalOpen}
        onOpenChange={props.setIsPaymentModalOpen}
      >
        <DialogContent className="max-w-3xl lg:max-w-4xl w-[95vw] p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xl">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
            <div className="relative space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck size={12} /> Official Clearance Gateway
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  <Lock size={10} /> 256-Bit SSL Secured
                </span>
              </div>
              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <CreditCard className="size-6 sm:size-7 text-blue-400" />
                  Official Transcript Clearance
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl">
                  Clearance fee required by {props.schoolName} for archival
                  records verification, electronic endorsement, and official document release.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 space-y-5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-600 font-black text-sm flex items-center justify-center shrink-0">
                      {props.studentName ? props.studentName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {props.studentName || "Enrolled Scholar"}
                      </p>
                      <p className="text-[11px] font-mono font-semibold text-blue-600 truncate">
                        ID: {props.studentCode || "SCH-RECORD"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Scope
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-zinc-300">
                      {props.paymentTargetSessionId && props.paymentTargetTerm
                        ? `${sessionName} • ${getTermLabel(props.paymentTargetTerm)}`
                        : "Select Session & Term"}
                    </span>
                  </div>
                </div>

                {/* Session Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-600" /> 1. Select
                      Academic Session <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <Select
                    value={props.paymentTargetSessionId}
                    onValueChange={props.setPaymentTargetSessionId}
                  >
                    <SelectTrigger className="h-12 px-4 rounded-2xl border font-bold text-xs bg-white dark:bg-zinc-900">
                      <SelectValue placeholder="Choose Academic Session..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl">
                      {props.availableSessions.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="py-3 text-xs font-semibold">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term Selector */}
                <ClearanceTermSelector
                  selectedTerm={props.paymentTargetTerm}
                  onSelectTerm={props.setPaymentTargetTerm}
                />

                {/* Scope Status Alert */}
                <ClearanceScopeStatusCard
                  hasNoData={hasNoData}
                  isGraduated={props.isGraduated}
                  sessionId={props.paymentTargetSessionId}
                  sessionName={sessionName}
                  term={props.paymentTargetTerm}
                />

                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                    What this official clearance covers:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <CheckCheck size={14} className="text-emerald-600 mt-0.5" />
                      <span>Instant unmasking of full course results, CGPA &amp; GPA points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCheck size={14} className="text-emerald-600 mt-0.5" />
                      <span>Certified Registrar seal, digital signatures &amp; 30-day verified pass</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-800 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Clearance Fee
                    </span>
                    <p className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                      {props.isFeeLoading ? "loading..." : `₦${props.effectiveFee.toLocaleString()}`}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      One-time official institutional fee
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Beneficiary
                      </span>
                      <p className="font-black text-white truncate max-w-[170px] mt-0.5">
                        {props.schoolName}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck size={12} /> Verified Subaccount
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={props.onInitiateOnlinePayment}
                    disabled={
                      props.isPayingOnline ||
                      !props.paymentTargetSessionId ||
                      !props.paymentTargetTerm ||
                      hasNoData
                    }
                    className="w-full h-12 rounded-2xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {props.isPayingOnline ? (
                      <span>Connecting to Flutterwave...</span>
                    ) : hasNoData ? (
                      <span>No Records to Clear</span>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>{props.isFeeLoading ? "Loading pricing..." : `Pay ₦${props.effectiveFee.toLocaleString()} via Flutterwave`}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              Powered by Flutterwave • PCI-DSS Level 1 Certified
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => props.setIsPaymentModalOpen(false)}
              className="rounded-xl text-xs font-bold text-slate-500"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TranscriptRestoreModal
        isOpen={props.isRestoreModalOpen}
        onOpenChange={props.setIsRestoreModalOpen}
        restoreInput={props.restoreInput}
        setRestoreInput={props.setRestoreInput}
        isRestoring={props.isRestoring}
        onRestoreAccess={props.onRestoreAccess}
      />
    </>
  );
}
