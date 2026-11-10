"use client";

import React, { useRef, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentTranscriptData } from "./hooks/useStudentTranscriptData";
import { useTranscriptClearance } from "./hooks/useTranscriptClearance";
import { useTranscriptActions } from "./hooks/useTranscriptActions";
import { TranscriptTopBar } from "./components/TranscriptTopBar";
import { TranscriptNotConnectedGate } from "./components/TranscriptDocumentChrome";
import { TranscriptAcademicPage } from "./components/TranscriptAcademicPage";
import { TranscriptBehavioralPage } from "./components/TranscriptBehavioralPage";
import { TranscriptAuditSidebar } from "./components/TranscriptAuditSidebar";
import { TranscriptClearanceModals } from "./components/TranscriptClearanceModals";
import { StudentOfficialTranscriptExportModal } from "./components/StudentOfficialTranscriptExportModal";
import { StudentTranscriptSpreadsheetData } from "./utils/transcriptSpreadsheetExporter";
import { getTermLabel } from "./types/transcript.types";

export default function StudentTranscriptPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const data = useStudentTranscriptData();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const clearance = useTranscriptClearance({
    studentId: data.studentId,
    transcriptFee: data.transcriptFee,
    isGraduated: data.isGraduated,
    isSchoolPaidPlan: data.isSchoolPaidPlan,
    results: data.results,
    selectedSessionId: data.selectedSessionId,
    selectedTermFilter: data.selectedTermFilter,
    auditData: data.auditData as Record<string, unknown> | null | undefined,
    refetchAudit: data.refetchAudit,
  });

  const actions = useTranscriptActions({
    studentId: data.studentId,
    studentProfile: data.studentProfile as
      | Record<string, unknown>
      | null
      | undefined,
    user: data.user as Record<string, unknown> | null | undefined,
    schoolId: data.schoolId,
    schoolName: data.schoolName,
    schoolMotto: data.schoolMotto,
    schoolLocation: data.schoolLocation,
    schoolLogoUrl: data.schoolLogoUrl,
    gradingSystem: data.gradingSystem,
    transcriptFee: data.transcriptFee,
    isFeeLoading: data.isFeeLoading,
    isGraduated: data.isGraduated,
    filteredResults: data.filteredResults,
    availableSessions: data.availableSessions,
    selectedSessionId: data.selectedSessionId,
    selectedTermFilter: data.selectedTermFilter,
    transcriptStats: data.transcriptStats,
    activeEvalGroup: data.activeEvalGroup,
    evalTerm: data.evalTerm,
    serverEvaluation: data.serverEvaluation as
      | Record<string, unknown>
      | null
      | undefined,
    enrolledClass: data.enrolledClass,
    principalSlot: data.principalSlot,
    registrarSlot: data.registrarSlot,
    requiresPayment: clearance.requiresPayment,
    isCurrentViewUnlocked: clearance.isCurrentViewUnlocked,
    hasDownloadRemaining: clearance.hasDownloadRemaining,
    paymentTargetSessionId: clearance.paymentTargetSessionId,
    setPaymentTargetSessionId: clearance.setPaymentTargetSessionId,
    paymentTargetTerm: clearance.paymentTargetTerm,
    setPaymentTargetTerm: clearance.setPaymentTargetTerm,
    setIsPaymentModalOpen: clearance.setIsPaymentModalOpen,
    setIsPayingOnline: clearance.setIsPayingOnline,
    setIsExporting: clearance.setIsExporting,
    setLocalTranscriptDownloads: clearance.setLocalTranscriptDownloads,
    setCopiedField: clearance.setCopiedField,
    directAccessPass: clearance.directAccessPass,
    setDirectAccessPass: clearance.setDirectAccessPass,
    setUnlockedClearances: clearance.setUnlockedClearances,
    setIsEmailingPass: clearance.setIsEmailingPass,
    setIsResendingLink: clearance.setIsResendingLink,
    restoreInput: clearance.restoreInput,
    setRestoreInput: clearance.setRestoreInput,
    setIsRestoring: clearance.setIsRestoring,
    setIsRestoreModalOpen: clearance.setIsRestoreModalOpen,
    recentClearancePayments: clearance.recentClearancePayments,
    refetchAudit: data.refetchAudit,
    recordDownloadMutation: data.recordDownloadMutation,
  });

  if (data.isProfileLoading || data.isResultsLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!data.isSchoolConnected) {
    return <TranscriptNotConnectedGate />;
  }

  const departmentOrClass =
    (data.studentProfile?.department as { name?: string } | undefined)?.name ||
    data.enrolledClass;

  const currentSessionName =
    data.selectedSessionId === "ALL"
      ? "All Sessions (Cumulative)"
      : data.availableSessions.find((s) => s.id === data.selectedSessionId)?.name || "Academic Session";

  const currentTermLabel =
    data.selectedTermFilter === "ALL"
      ? "All Terms (Full Session)"
      : getTermLabel(data.selectedTermFilter);

  const transcriptSpreadsheetData: StudentTranscriptSpreadsheetData | null = useMemo(() => {
    return {
      studentName: String(data.studentProfile?.name || data.user?.name || "Scholar"),
      studentCode: String(data.studentProfile?.studentCode || "Scholar"),
      departmentOrClass: departmentOrClass || "Enrolled Class",
      schoolName: data.schoolName,
      schoolLocation: data.schoolLocation,
      stats: data.transcriptStats,
      filteredResults: data.filteredResults,
      selectedSessionName: currentSessionName,
      selectedTermLabel: currentTermLabel,
      gradingSystem: data.gradingSystem,
    };
  }, [data, departmentOrClass, currentSessionName, currentTermLabel]);

  const handleOpenExportModal = () => {
    if (clearance.requiresPayment && !clearance.isCurrentViewUnlocked) {
      actions.openPaymentModalForCurrentScope();
      return;
    }
    setIsExportModalOpen(true);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans">
      <TranscriptTopBar
        activePageView={data.activePageView}
        setActivePageView={data.setActivePageView}
        isSidebarOpen={data.isSidebarOpen}
        setIsSidebarOpen={data.setIsSidebarOpen}
        handlePrint={actions.handlePrint}
        handleDownloadPDF={handleOpenExportModal}
        isExporting={clearance.isExporting}
        requiresPayment={clearance.requiresPayment}
        isCurrentViewUnlocked={clearance.isCurrentViewUnlocked}
        isGraduated={data.isGraduated}
        hasDownloadRemaining={clearance.hasDownloadRemaining}
        effectiveFee={actions.effectiveFee}
        isFeeLoading={actions.isFeeLoading}
        selectedSessionId={data.selectedSessionId}
        setSelectedSessionId={data.setSelectedSessionId}
        selectedTermFilter={data.selectedTermFilter}
        setSelectedTermFilter={data.setSelectedTermFilter}
        availableSessions={data.availableSessions}
        accessTier={data.accessTier}
        onOpenClearanceModal={actions.openPaymentModalForCurrentScope}
      />

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div ref={printRef} className="flex-1 min-w-0 w-full space-y-10">
          <TranscriptAcademicPage
            activePageView={data.activePageView}
            schoolName={data.schoolName}
            schoolMotto={data.schoolMotto}
            schoolLocation={data.schoolLocation}
            schoolLogoUrl={data.schoolLogoUrl}
            onLogoError={() => data.setLogoLoadError(true)}
            studentName={data.studentProfile?.name}
            studentCode={data.studentProfile?.studentCode}
            studentProfileImage={data.studentProfile?.profileImage}
            departmentOrClass={departmentOrClass}
            enrolledClass={data.enrolledClass}
            scholarEmail={data.studentProfile?.email || data.user?.email}
            isGraduated={data.isGraduated}
            graduatedSchools={data.graduatedSchools}
            accessTier={data.accessTier}
            directAccessPass={clearance.directAccessPass}
            availableSessions={data.availableSessions}
            copiedField={clearance.copiedField}
            isEmailingPass={clearance.isEmailingPass}
            isResendingLink={clearance.isResendingLink}
            onCopyAccessLink={actions.handleCopyAccessLink}
            onEmailAccessLink={actions.handleEmailAccessLink}
            onResendLink={actions.handleResendLink}
            onOpenRestoreModal={() => clearance.setIsRestoreModalOpen(true)}
            onOpenClearanceModal={actions.openPaymentModalForCurrentScope}
            onSelectTermForClearance={(sessionId, term) => {
              clearance.setPaymentTargetSessionId(sessionId);
              clearance.setPaymentTargetTerm(term);
              clearance.setIsPaymentModalOpen(true);
            }}
            requiresPayment={clearance.requiresPayment}
            isCurrentViewUnlocked={clearance.isCurrentViewUnlocked}
            hasAnyUnlockedTerm={clearance.hasAnyUnlockedTerm}
            isTermUnlocked={clearance.isTermUnlocked}
            recentClearancePayments={clearance.recentClearancePayments}
            transcriptStats={data.transcriptStats}
            effectiveFee={actions.effectiveFee}
            isFeeLoading={actions.isFeeLoading}
            resultsCount={data.results.length}
            filteredResults={data.filteredResults}
            filteredGroupedBySession={data.filteredGroupedBySession}
            selectedSessionId={data.selectedSessionId}
            selectedTermFilter={data.selectedTermFilter}
            onResetFilters={() => {
              data.setSelectedSessionId("ALL");
              data.setSelectedTermFilter("ALL");
            }}
            gradingSystem={data.gradingSystem}
            registrarSlot={data.registrarSlot}
            principalSlot={data.principalSlot}
          />

          <TranscriptBehavioralPage
            activePageView={data.activePageView}
            schoolName={data.schoolName}
            schoolMotto={data.schoolMotto}
            schoolLocation={data.schoolLocation}
            schoolLogoUrl={data.schoolLogoUrl}
            onLogoError={() => data.setLogoLoadError(true)}
            studentName={data.studentProfile?.name}
            studentCode={data.studentProfile?.studentCode}
            studentProfileImage={data.studentProfile?.profileImage}
            departmentOrClass={departmentOrClass}
            enrolledClass={data.enrolledClass}
            isGraduated={data.isGraduated}
            evalCandidates={data.evalCandidates}
            safeEvalIdx={data.safeEvalIdx}
            setSelectedEvaluationIdx={data.setSelectedEvaluationIdx}
            activeEvalGroup={data.activeEvalGroup}
            evalSessionId={data.evalSessionId}
            evalTerm={data.evalTerm}
            serverEvaluation={
              data.serverEvaluation as
              | Record<string, unknown>
              | null
              | undefined
            }
            requiresPayment={clearance.requiresPayment}
            isTermUnlocked={clearance.isTermUnlocked}
            recentClearancePayments={clearance.recentClearancePayments}
            effectiveFee={actions.effectiveFee}
            isFeeLoading={actions.isFeeLoading}
            isResendingLink={clearance.isResendingLink}
            onResendLink={actions.handleResendLink}
            onSelectTermForClearance={(sessionId, term) => {
              clearance.setPaymentTargetSessionId(sessionId);
              clearance.setPaymentTargetTerm(term);
              clearance.setIsPaymentModalOpen(true);
            }}
            onOpenRestoreModal={() => clearance.setIsRestoreModalOpen(true)}
            transcriptStats={data.transcriptStats}
            registrarSlot={data.registrarSlot}
            principalSlot={data.principalSlot}
          />
        </div>

        {data.isSidebarOpen && (
          <TranscriptAuditSidebar
            schoolName={data.schoolName}
            schoolLocation={data.schoolLocation}
            studentCode={data.studentProfile?.studentCode}
            isAuditLoading={data.isAuditLoading}
            onRefreshAudit={data.refetchAudit}
            copiedField={clearance.copiedField}
            onCopy={actions.handleCopy}
            principalSlot={data.principalSlot}
            registrarSlot={data.registrarSlot}
            requiresPayment={clearance.requiresPayment}
            isCurrentViewUnlocked={clearance.isCurrentViewUnlocked}
            effectiveFee={actions.effectiveFee}
            isFeeLoading={actions.isFeeLoading}
            accessTier={data.accessTier}
            onOpenClearanceModal={actions.openPaymentModalForCurrentScope}
            totalTranscriptDownloads={clearance.totalTranscriptDownloads}
            isGraduated={data.isGraduated}
            hasDownloadRemaining={clearance.hasDownloadRemaining}
            auditData={
              data.auditData as Record<string, unknown> | null | undefined
            }
            results={data.results}
            isTermUnlocked={clearance.isTermUnlocked}
            onSelectTermForClearance={(sessionId, term) => {
              clearance.setPaymentTargetSessionId(sessionId);
              clearance.setPaymentTargetTerm(term);
              clearance.setIsPaymentModalOpen(true);
            }}
          />
        )}
      </div>

      <TranscriptClearanceModals
        isPaymentModalOpen={clearance.isPaymentModalOpen}
        setIsPaymentModalOpen={clearance.setIsPaymentModalOpen}
        schoolName={data.schoolName}
        studentName={data.studentProfile?.name || data.user?.name}
        studentCode={data.studentProfile?.studentCode}
        availableSessions={data.availableSessions}
        paymentTargetSessionId={clearance.paymentTargetSessionId}
        setPaymentTargetSessionId={clearance.setPaymentTargetSessionId}
        paymentTargetTerm={clearance.paymentTargetTerm}
        setPaymentTargetTerm={clearance.setPaymentTargetTerm}
        effectiveFee={actions.effectiveFee}
        isPayingOnline={clearance.isPayingOnline}
        onInitiateOnlinePayment={actions.handleInitiateOnlinePayment}
        isRestoreModalOpen={clearance.isRestoreModalOpen}
        setIsRestoreModalOpen={clearance.setIsRestoreModalOpen}
        restoreInput={clearance.restoreInput}
        setRestoreInput={clearance.setRestoreInput}
        isRestoring={clearance.isRestoring}
        onRestoreAccess={actions.handleRestoreAccess}
        results={data.results}
        isGraduated={data.isGraduated}
      />

      <StudentOfficialTranscriptExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={transcriptSpreadsheetData}
        schoolProfile={data.schoolProfile || {
          name: data.schoolName,
          motto: data.schoolMotto,
          logo: data.schoolLogoUrl,
          address: data.schoolLocation,
        }}
        schoolId={data.schoolId}
        onExportPdf={actions.handleDownloadPDF}
        isExportingPdf={clearance.isExporting}
      />
    </div>
  );
}
