"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { isSchoolOnPayingPlan } from "@/utils/subscriptionPlanCheck";
import {
  getMonthlyExportUsage,
  incrementMonthlyExportUsage,
  FREE_TIER_MONTHLY_EXPORT_LIMIT,
} from "@/utils/exportQuotaManager";
import { dispatchExportLeadershipNotification } from "@/lib/api/services/exportNotificationService";
import { resolveDigitalSignatures } from "@/app/dashboard/admin/grades/utils/signatureResolver";
import { ExportQuotaBanner } from "@/app/dashboard/admin/grades/components/export/ExportQuotaBanner";
import { generatePDF } from "@/utils/pdfGenerator";
import { ExamDetailData } from "../types";
import {
  exportExamReviewToExcel,
  exportExamReviewToCSV,
  ExamReviewSpreadsheetData,
} from "@/app/dashboard/student/exams&quizzes/utils/assessmentSpreadsheetExporter";

export interface ParentExamDetailExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExamDetailData;
}

export function ParentExamDetailExportModal({
  isOpen,
  onClose,
  data,
}: ParentExamDetailExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const schoolProfile = data.schoolProfile;
  const schoolId = (schoolProfile?.id as string | undefined) || undefined;

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
      (schoolProfile?.plan && String(schoolProfile.plan).toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "parent-quota-exam-detail";
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));

  const hasExhaustedFreeQuota = !isPaying && quota.remaining <= 0;

  const handleExport = async () => {
    if (!data) return;

    if (!isPaying && selectedFormat !== "pdf") {
      toast.warning("Spreadsheet formats (.xlsx and .csv) are exclusive to Pro institutional plans. Switching to PDF.");
      setSelectedFormat("pdf");
      return;
    }

    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT} downloads/month). Please upgrade to institutional Pro plan for unlimited exports.`
      );
      return;
    }

    setIsExporting(true);

    try {
      const primarySubject = data.subjects[0]?.name || "Assessment Subject";
      const studentClass = data.currentClass || "Class Cohort";

      const spreadsheetData: ExamReviewSpreadsheetData = {
        studentName: data.studentName,
        studentCode: data.studentCode,
        className: studentClass,
        examTitle: data.title,
        subjectName: primarySubject,
        scoreObtained: data.score,
        totalMarks: data.totalScore,
        accuracy: data.percentage,
        questions: (data.questions || []).map((q, idx) => ({
          questionNumber: typeof q.number === "number" ? q.number : idx + 1,
          questionText: q.title || `Question ${idx + 1}`,
          studentAnswer: q.userAnswer || "Selected Option",
          correctAnswer: q.correctAnswer || "Official Solution",
          scoreAwarded: q.scoreAwarded ?? (q.isCorrect ? Number(q.points) || 1 : 0),
          maxMarks: q.maxMarks || Number(q.points) || 1,
          evaluation: q.isCorrect ? "CORRECT" : "NEEDS REVIEW",
        })),
      };

      if (selectedFormat === "excel") {
        exportExamReviewToExcel(spreadsheetData);
      } else if (selectedFormat === "csv") {
        exportExamReviewToCSV(spreadsheetData);
      } else {
        // PDF Export
        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        const tableHeaders = [
          ["#", "Subject / Paper", "Teacher / Faculty", "Score", "Max Marks", "Percentage", "Remarks"],
        ];

        const tableData = data.subjects.length > 0
          ? data.subjects.map((s, idx) => [
              (idx + 1).toString(),
              s.name,
              s.teacher || "—",
              s.score.toString(),
              s.totalMarks.toString(),
              `${s.percentage}%`,
              s.remarks || "—",
            ])
          : [
              ["1", data.title, "Subject Faculty", data.score.toString(), data.totalScore.toString(), `${data.percentage}%`, "Completed Assessment"],
            ];

        const additionalTables = data.questions && data.questions.length > 0
          ? [
              {
                title: "Question Breakdown & Evaluation",
                headers: [["Q#", "Question / Topic", "Points", "Awarded", "Status"]],
                data: data.questions.map((q) => [
                  q.number.toString(),
                  q.title,
                  q.points,
                  q.scoreAwarded?.toString() || (q.isCorrect ? q.points : "0"),
                  q.isCorrect ? "CORRECT" : "NEEDS REVIEW",
                ]),
              },
            ]
          : undefined;

        const metaData = [
          { label: "Student Name", value: data.studentName },
          { label: "Student ID", value: data.studentCode },
          { label: "Class Cohort", value: studentClass },
          { label: "Examination Title", value: data.title },
          { label: "Subject", value: primarySubject },
          { label: "Date Completed", value: data.date },
          { label: "Overall Score", value: `${data.score} / ${data.totalScore} (${data.percentage}%)` },
          { label: "Grade", value: data.grade },
          { label: "Proficiency", value: data.proficiency || "Proficient" },
          { label: "Export Date", value: new Date().toLocaleDateString() },
        ];

        const safeStudent = data.studentName.replace(/\s+/g, "_");
        const safeTitle = data.title.replace(/\s+/g, "_");

        await generatePDF({
          title: `EXAMINATION PERFORMANCE REPORT & BREAKDOWN`,
          filename: `${safeStudent}_${safeTitle}_Exam_Review.pdf`,
          schoolProfile: data.schoolProfile,
          metaData,
          tableHeaders,
          tableData,
          additionalTables,
          signatures: isPaying
            ? {
                right: {
                  label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
                  name: digitalSignatures?.adminName || "Head of Institution",
                  signatureUrl: digitalSignatures?.principalSigUrl,
                  subLabel: "Official Examination Audit",
                },
              }
            : {
                left: { label: "Subject Examiner", name: "—", subLabel: "Exam Review" },
                right: { label: "Principal / Director", name: "—", subLabel: "Unendorsed Copy" },
              },
          orientation: "portrait",
        });
      }

      // Decrement quota for free users
      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      // Dispatch audit notification
      if (schoolId) {
        await dispatchExportLeadershipNotification({
          schoolId: schoolId,
          actorName: data.studentName,
          actorRole: "PARENT",
          resourceTitle: `Exam Review: ${data.title}`,
          recordCount: data.questions?.length || 1,
          format: selectedFormat === "excel" ? "EXCEL" : selectedFormat === "csv" ? "CSV" : "PDF",
        });
      }

      toast.success(`Exam review exported successfully as ${selectedFormat.toUpperCase()}`);
      onClose();
    } catch (err) {
      console.error("[ParentExamDetailExportModal] Export failed:", err);
      toast.error("Failed to generate export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-zinc-950 p-6 border-slate-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-600" />
            <span>Export Examination Review</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            Download question breakdown, solution keys, and performance diagnostics for {data.title}.
          </DialogDescription>
        </DialogHeader>

        {/* Quota Banner */}
        <div className="my-2">
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
            userRole="PARENT"
          />
        </div>

        {/* Format Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Export Format
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedFormat("pdf")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                selectedFormat === "pdf"
                  ? "border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
              }`}
            >
              <FileText className="w-5 h-5 mb-1 text-rose-500" />
              <span>PDF Document</span>
              <span className="text-[10px] text-slate-400 font-normal">All Tiers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isPaying) {
                  toast.info("Excel spreadsheets are exclusively available on institutional Pro plans.");
                  return;
                }
                setSelectedFormat("excel");
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative ${
                selectedFormat === "excel"
                  ? "border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
              } ${!isPaying ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {!isPaying && (
                <span className="absolute top-1.5 right-1.5 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded font-black">
                  PRO
                </span>
              )}
              <FileSpreadsheet className="w-5 h-5 mb-1 text-emerald-600" />
              <span>Excel (.xlsx)</span>
              <span className="text-[10px] text-slate-400 font-normal">Institutional</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isPaying) {
                  toast.info("CSV spreadsheets are exclusively available on institutional Pro plans.");
                  return;
                }
                setSelectedFormat("csv");
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative ${
                selectedFormat === "csv"
                  ? "border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
              } ${!isPaying ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {!isPaying && (
                <span className="absolute top-1.5 right-1.5 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded font-black">
                  PRO
                </span>
              )}
              <FileSpreadsheet className="w-5 h-5 mb-1 text-blue-500" />
              <span>CSV (.csv)</span>
              <span className="text-[10px] text-slate-400 font-normal">Institutional</span>
            </button>
          </div>
        </div>

        {/* Verification Notice */}
        <div className="rounded-xl p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Digital Endorsement Status</span>
          </div>
          <p>
            {isPaying
              ? "Official digital signatures from institution leadership will be attached automatically."
              : "Standard unendorsed report format. Institutional verified digital signatures require an upgraded school plan."}
          </p>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-xl text-xs h-9 px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || hasExhaustedFreeQuota || !data}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-9 px-5 gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

