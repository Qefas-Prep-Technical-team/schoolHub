import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GradingRule } from "@/utils/gradingSystem";
import {
  GraduationCap,
  Lock,
  Award,
  BookOpen,
  Calendar,
  FileText,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import {
  PublishedResultGroup,
  SignatureSlotInfo,
  DirectAccessPassState,
  GraduatedSchoolBadge,
  TranscriptStatsSummary,
  StudentTranscriptAccessTier,
  getTermLabel,
} from "../types/transcript.types";
import {
  TranscriptLetterhead,
  TranscriptStudentBanner,
  TranscriptGraduatedBadges,
  TranscriptSignaturesFooter,
} from "./TranscriptDocumentChrome";
import {
  TranscriptActivePassBanner,
  TranscriptRecentClearedBanner,
  TranscriptTierPaywallCard,
} from "./TranscriptClearanceBanners";
import { TranscriptTermCourseCard } from "./TranscriptTermCourseCard";

interface TranscriptAcademicPageProps {
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
  scholarEmail?: string;
  isGraduated: boolean;
  graduatedSchools: GraduatedSchoolBadge[];
  accessTier: StudentTranscriptAccessTier;
  directAccessPass: DirectAccessPassState | null;
  availableSessions: Array<{ id: string; name: string }>;
  copiedField: string | null;
  isEmailingPass: boolean;
  isResendingLink: boolean;
  onCopyAccessLink: () => void;
  onEmailAccessLink: () => void;
  onResendLink: (ref?: string) => void;
  onOpenRestoreModal: () => void;
  onOpenClearanceModal: () => void;
  onSelectTermForClearance: (sessionId: string, term: string) => void;
  requiresPayment: boolean;
  isCurrentViewUnlocked: boolean;
  hasAnyUnlockedTerm: boolean;
  isTermUnlocked: (sessionId: string, term: string) => boolean;
  recentClearancePayments: Array<Record<string, unknown>>;
  transcriptStats: TranscriptStatsSummary;
  effectiveFee: number;
  isFeeLoading?: boolean;
  resultsCount: number;
  filteredResults: PublishedResultGroup[];
  filteredGroupedBySession: Array<{
    sessionId: string;
    sessionName: string;
    terms: PublishedResultGroup[];
  }>;
  selectedSessionId: string;
  selectedTermFilter: string;
  onResetFilters: () => void;
  gradingSystem: GradingRule[] | null | undefined;
  registrarSlot: SignatureSlotInfo;
  principalSlot: SignatureSlotInfo;
}

export function TranscriptAcademicPage(props: TranscriptAcademicPageProps) {
  const isMasked = props.requiresPayment && !props.isCurrentViewUnlocked;
  const isFilterActive =
    props.selectedSessionId !== "ALL" || props.selectedTermFilter !== "ALL";

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0",
        props.activePageView === "page2" ? "hidden print:block" : "block",
      )}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
        <GraduationCap className="w-96 h-96 mx-auto text-slate-900 dark:text-white" />
      </div>

      <TranscriptLetterhead
        schoolName={props.schoolName}
        schoolMotto={props.schoolMotto}
        schoolLocation={props.schoolLocation}
        schoolLogoUrl={props.schoolLogoUrl}
        onLogoError={props.onLogoError}
        studentName={props.studentName}
        studentProfileImage={props.studentProfileImage}
        pageSubtitle="Office of the Registrar & Academic Council"
      />

      <TranscriptStudentBanner
        studentName={props.studentName}
        studentCode={props.studentCode}
        departmentOrClass={props.departmentOrClass}
        isGraduated={props.isGraduated}
        refPrefix="Academic Transcript"
      />

      {props.isGraduated && (
        <TranscriptGraduatedBadges graduatedSchools={props.graduatedSchools} />
      )}

      {props.directAccessPass && (
        <TranscriptActivePassBanner
          directAccessPass={props.directAccessPass}
          availableSessions={props.availableSessions}
          enrolledClass={props.enrolledClass}
          copiedField={props.copiedField}
          isEmailingPass={props.isEmailingPass}
          onCopyAccessLink={props.onCopyAccessLink}
          onEmailAccessLink={props.onEmailAccessLink}
        />
      )}

      {props.requiresPayment &&
        !props.directAccessPass &&
        props.recentClearancePayments.length > 0 && (
          <TranscriptRecentClearedBanner
            recentClearancePayments={props.recentClearancePayments}
            enrolledClass={props.enrolledClass}
            scholarEmail={props.scholarEmail}
            isResendingLink={props.isResendingLink}
            onResendLink={props.onResendLink}
            onOpenRestoreModal={props.onOpenRestoreModal}
          />
        )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 space-y-1">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} /> Cumulative CGPA
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isMasked ? "••••" : props.transcriptStats.cgpa}
            </span>
            {isMasked ? (
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Lock size={11} /> Locked
              </span>
            ) : (
              <>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  ({props.transcriptStats.cgpaGrade})
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  / 5.00
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5 truncate">
            {isMasked
              ? "Official Records Protected"
              : props.transcriptStats.academicStanding}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Cumulative Average
          </span>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isMasked
                ? "••••"
                : `${props.transcriptStats.cumulativeAverage}%`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {isMasked
              ? "Clearance required"
              : `Over ${props.transcriptStats.scoredSubjectCount} verified scores`}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-500" /> Total Subjects
          </span>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isMasked ? "••••" : props.transcriptStats.totalSubjectsOverall}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {isMasked ? "Clearance required" : "Registered in transcript"}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-500" /> Completed Terms
          </span>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isMasked ? "••••" : props.transcriptStats.totalTerms}
            </span>
            {!isMasked && (
              <span className="text-xs font-semibold text-slate-400">
                ({props.transcriptStats.totalSessions} Sessions)
              </span>
            )}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {isMasked ? "Clearance required" : "Certified terminal score sheets"}
          </p>
        </div>
      </div>

      {props.requiresPayment && !props.isCurrentViewUnlocked ? (
        <TranscriptTierPaywallCard
          accessTier={props.accessTier}
          schoolName={props.schoolName}
          effectiveFee={props.effectiveFee}
          isFeeLoading={props.isFeeLoading}
          onOpenClearanceModal={props.onOpenClearanceModal}
          onOpenRestoreModal={props.onOpenRestoreModal}
        />
      ) : (
        <>
          <div className="space-y-8 pt-2">
            {props.filteredResults.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {props.resultsCount === 0
                    ? "No Certified Transcript Records Found"
                    : "No Records Match Filter Criteria"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  {props.resultsCount === 0
                    ? props.isGraduated
                      ? "Your student record is indexed as a Graduate/Alumni. Official terminal scores will appear here as soon as approved and published by school administration."
                      : "Official terminal scores will appear here once approved and published by school administration."
                    : "Try selecting 'All Sessions' or 'All Terms' from the top bar to view your full transcript history."}
                </p>
                {isFilterActive && (
                  <div className="pt-2 flex justify-center">
                    <Button
                      onClick={props.onResetFilters}
                      className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} /> <span>Reset Filters</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              props.filteredGroupedBySession.map(
                ({ sessionId, sessionName, terms }) => (
                  <div key={sessionId} className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-zinc-700">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        <span>{sessionName}</span>
                      </h3>
                      <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                        {terms.length}{" "}
                        {terms.length === 1 ? "Term Record" : "Term Records"}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {terms.map((termGroup, termIdx) => {
                        const termLabel = getTermLabel(termGroup.term);
                        const matchingClearedPayment =
                          props.recentClearancePayments.find(
                            (p) =>
                              (p.session === "All Sessions" ||
                                p.session === "ALL" ||
                                p.session === sessionId ||
                                p.session === sessionName) &&
                              (p.term === "All Terms" ||
                                p.term === "ALL" ||
                                p.term === termGroup.term ||
                                p.term === termLabel),
                          );

                        return (
                          <TranscriptTermCourseCard
                            key={`${sessionId}-${termGroup.term}-${termIdx}`}
                            sessionId={sessionId}
                            sessionName={sessionName}
                            termGroup={termGroup}
                            termIdx={termIdx}
                            requiresPayment={props.requiresPayment}
                            isThisTermUnlocked={props.isTermUnlocked(
                              sessionId,
                              termGroup.term,
                            )}
                            matchingClearedPayment={matchingClearedPayment}
                            effectiveFee={props.effectiveFee}
                            isFeeLoading={props.isFeeLoading}
                            isResendingLink={props.isResendingLink}
                            gradingSystem={props.gradingSystem}
                            onResendLink={props.onResendLink}
                            onSelectTermForClearance={
                              props.onSelectTermForClearance
                            }
                            onOpenRestoreModal={props.onOpenRestoreModal}
                          />
                        );
                      })}
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                CGPA:{" "}
                {isMasked
                  ? "•••• (Locked)"
                  : `${props.transcriptStats.cgpa} (${props.transcriptStats.cgpaGrade})`}
              </span>
              {!isMasked && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {props.transcriptStats.academicStanding}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {isMasked ? (
                "Complete term clearance to reveal cumulative average."
              ) : (
                <>
                  Overall Average:{" "}
                  <strong className="text-slate-800 dark:text-zinc-200">
                    {props.transcriptStats.cumulativeAverage}%
                  </strong>{" "}
                  across {props.transcriptStats.scoredSubjectCount} certified
                  courses
                </>
              )}
            </p>
          </div>
        </>
      )}

      <TranscriptSignaturesFooter
        registrarSlot={props.registrarSlot}
        principalSlot={props.principalSlot}
        isLocked={isMasked}
        isGraduated={props.isGraduated}
        transcriptFee={props.effectiveFee}
        isFeeLoading={props.isFeeLoading}
        onUnlockClick={props.onOpenClearanceModal}
      />
    </div>
  );
}
