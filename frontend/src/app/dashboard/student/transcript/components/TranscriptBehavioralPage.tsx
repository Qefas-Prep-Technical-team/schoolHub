import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Heart,
  Quote,
  Mail,
  Key,
} from "lucide-react";
import {
  PublishedResultGroup,
  SignatureSlotInfo,
  TranscriptStatsSummary,
  AFFECTIVE_TRAITS,
  PSYCHOMOTOR_SKILLS,
  getTermLabel,
} from "../types/transcript.types";
import {
  TranscriptLetterhead,
  TranscriptStudentBanner,
  TranscriptSignaturesFooter,
} from "./TranscriptDocumentChrome";

interface TranscriptBehavioralPageProps {
  activePageView: "all" | "page1" | "page2";
  schoolName: string;
  schoolMotto: string;
  schoolLocation: string;
  schoolLogoUrl: string | null;
  onLogoError: () => void;
  studentName?: string;
  studentCode?: string;
  studentProfileImage?: string | null;
  departmentOrClass: string;
  enrolledClass: string;
  isGraduated: boolean;
  evalCandidates: PublishedResultGroup[];
  safeEvalIdx: number;
  setSelectedEvaluationIdx: (idx: number) => void;
  activeEvalGroup: PublishedResultGroup | undefined;
  evalSessionId: string;
  evalTerm: "FIRST" | "SECOND" | "THIRD";
  serverEvaluation: Record<string, unknown> | null | undefined;
  requiresPayment: boolean;
  isTermUnlocked: (sessionId: string, term: string) => boolean;
  recentClearancePayments: Array<Record<string, unknown>>;
  effectiveFee: number;
  isFeeLoading?: boolean;
  isResendingLink: boolean;
  onResendLink: (ref?: string) => void;
  onSelectTermForClearance: (sessionId: string, term: string) => void;
  onOpenClearanceModal?: () => void;
  onOpenRestoreModal: () => void;
  transcriptStats: TranscriptStatsSummary;
  registrarSlot: SignatureSlotInfo;
  principalSlot: SignatureSlotInfo;
}

export function TranscriptBehavioralPage(props: TranscriptBehavioralPageProps) {
  const isEvalLocked =
    props.requiresPayment &&
    !props.isTermUnlocked(props.evalSessionId, props.evalTerm);
  const termLabel = getTermLabel(props.evalTerm);
  const matchingClearedPayment = props.recentClearancePayments.find(
    (p) =>
      (p.session === "All Sessions" ||
        p.session === "ALL" ||
        p.session === props.evalSessionId ||
        p.session === props.activeEvalGroup?.session?.name) &&
      (p.term === "All Terms" ||
        p.term === "ALL" ||
        p.term === props.evalTerm ||
        p.term === termLabel),
  );

  const renderDomainTable = (
    items: readonly { key: string; label: string; desc: string }[],
  ) => (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-2.5 px-4">Attribute / Skill</th>
            <th className="py-2.5 px-4 hidden sm:table-cell">Description</th>
            <th className="py-2.5 px-3 text-center w-24">Rating (1-5)</th>
            <th className="py-2.5 px-4 text-center w-40">Proficiency Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {items.map((item, idx) => {
            const score = Number(props.serverEvaluation?.[item.key] ?? 5);
            const badgeCls =
              score >= 5
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : score === 4
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : score === 3
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
            const label =
              score >= 5
                ? "Excellent"
                : score === 4
                  ? "Very Good"
                  : score === 3
                    ? "Good"
                    : "Fair";

            return (
              <tr
                key={item.key}
                className={
                  idx % 2 === 1
                    ? "bg-slate-50/50 dark:bg-zinc-900/30"
                    : "bg-white dark:bg-zinc-950"
                }
              >
                <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-zinc-100">
                  {item.label}
                </td>
                <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 hidden sm:table-cell text-[11px]">
                  {item.desc}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-200 dark:border-blue-800">
                    {score}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                      badgeCls,
                    )}
                  >
                    {label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:break-before-page",
        props.activePageView === "page1" ? "hidden print:block" : "block",
      )}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
        <Heart className="w-96 h-96 mx-auto text-slate-900 dark:text-white" />
      </div>

      <TranscriptLetterhead
        schoolName={props.schoolName}
        schoolMotto={props.schoolMotto}
        schoolLocation={props.schoolLocation}
        schoolLogoUrl={props.schoolLogoUrl}
        onLogoError={props.onLogoError}
        studentName={props.studentName}
        studentProfileImage={props.studentProfileImage}
        pageSubtitle="Department of Student Affairs & Behavioral Guidance"
      />

      <TranscriptStudentBanner
        studentName={props.studentName}
        studentCode={props.studentCode}
        departmentOrClass={props.departmentOrClass}
        isGraduated={props.isGraduated}
        refPrefix="Behavioral Record"
      />

      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-transparent dark:from-blue-950/20 dark:via-zinc-900/40 dark:to-transparent border border-blue-200/60 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider">
              Page 2 of 2
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Student Conduct Appraisal & Behavioral Domain Evaluation
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Official appraisal of behavioral traits, psychomotor skills, and
            institutional remarks.
          </p>
        </div>

        {props.evalCandidates.length > 1 && (
          <Select
            value={String(props.safeEvalIdx)}
            onValueChange={(val) => props.setSelectedEvaluationIdx(Number(val))}
          >
            <SelectTrigger className="w-[230px] h-9 px-3 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 print:hidden">
              <SelectValue placeholder="Select Term Evaluation" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              {props.evalCandidates.map((res, idx) => (
                <SelectItem
                  key={`${res.sessionId}-${res.term}-${idx}`}
                  value={String(idx)}
                  className="text-xs font-medium py-2"
                >
                  {res.session?.name} • {getTermLabel(res.term)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isEvalLocked ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-10 text-center space-y-4 my-6">
          <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            {matchingClearedPayment ? (
              <ShieldCheck size={30} />
            ) : (
              <Lock size={30} />
            )}
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {matchingClearedPayment
                ? `Conduct Evaluation Cleared (${termLabel})`
                : `Conduct & Character Evaluation Locked (${termLabel})`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {matchingClearedPayment
                ? `Cleared on ${format(new Date(String(matchingClearedPayment.paidAt || matchingClearedPayment.createdAt)), "dd MMM yyyy")}. Use your 30-day email pass link to preview.`
                : `Full certified appraisal of affective domain traits, psychomotor skills, and remarks for ${termLabel} requires session clearance of ${props.isFeeLoading ? "loading..." : `₦${props.effectiveFee.toLocaleString()}`}.`}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
            {matchingClearedPayment ? (
              <Button
                onClick={() =>
                  props.onResendLink(String(matchingClearedPayment.reference))
                }
                disabled={props.isResendingLink}
                className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm gap-2"
              >
                <Mail size={16} />
                <span>Resend Link to Preview Conduct Records</span>
              </Button>
            ) : (
              <Button
                onClick={() =>
                  props.onSelectTermForClearance(
                    props.evalSessionId,
                    props.evalTerm,
                  )
                }
                className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm gap-2"
              >
                <CreditCard size={16} />
                <span>
                  {props.isFeeLoading
                    ? "Loading pricing..."
                    : `Pay ₦${props.effectiveFee.toLocaleString()} to Unlock ${termLabel}`}
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={props.onOpenRestoreModal}
              className="h-12 px-5 rounded-2xl font-bold text-xs gap-1.5"
            >
              <Key size={14} /> <span>Enter Pass Token</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
              <Heart size={16} className="text-rose-500" />
              <span>Affective Domain Appraisal (Behavior & Social Conduct)</span>
            </h4>
            {renderDomainTable(AFFECTIVE_TRAITS)}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>
                Psychomotor Domain Appraisal (Physical & Practical Skills)
              </span>
            </h4>
            {renderDomainTable(PSYCHOMOTOR_SKILLS)}
          </div>

          <div className="pt-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              CGPA: {props.transcriptStats.cgpa} (
              {props.transcriptStats.cgpaGrade})
            </h3>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
              <Quote size={16} className="text-blue-600" />
              <span>Remarks:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Class Teacher&apos;s Remark
                </span>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800 min-h-[72px] flex items-center">
                  <p className="text-xs italic text-slate-800 dark:text-zinc-200 leading-relaxed font-serif">
                    &ldquo;
                    {String(props.serverEvaluation?.teacherRemark || "").trim() ||
                      "Consistently displays commendable discipline, attentiveness in class, and positive interaction with classmates."}
                    &rdquo;
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Principal&apos;s Certified Endorsement
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Attested
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-950/50 min-h-[72px] flex items-center">
                  <p className="text-xs italic text-slate-900 dark:text-zinc-100 leading-relaxed font-serif">
                    &ldquo;
                    {String(
                      props.serverEvaluation?.principalRemark || "",
                    ).trim() ||
                      "An exemplary scholar with admirable academic focus and leadership qualities. Certified in good standing."}
                    &rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen size={12} className="text-blue-600" />
              Standard Institutional Grading System Key (Scale 5.00)
            </span>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              A1 (75–100%: 5.0 GP) • B2/B3 (65–74%: 4.5–4.0 GP) • C4–C6 (50–64%:
              3.5–2.5 GP) • D7/E8 (40–49%: 1.5–1.0 GP) • F9 (0–39%: 0.0 GP)
            </p>
          </div>
        </>
      )}

      <TranscriptSignaturesFooter
        registrarSlot={props.registrarSlot}
        principalSlot={props.principalSlot}
        isLocked={isEvalLocked}
        isGraduated={props.isGraduated}
        transcriptFee={props.effectiveFee}
        isFeeLoading={props.isFeeLoading}
        onUnlockClick={props.onOpenClearanceModal}
      />
    </div>
  );
}

