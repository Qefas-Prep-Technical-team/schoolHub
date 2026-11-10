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
import {
  ParentExamsExportData,
  exportParentExamsToExcel,
  exportParentExamsToCSV,
} from "../utils/parentExamsSpreadsheetExporter";

export interface ParentExamsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ParentExamsExportData;
  schoolProfile?: {
    id?: string;
    name?: string;
    plan?: string;
    isSubscribed?: boolean;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export function ParentExamsExportModal({
  isOpen,
  onClose,
  data,
  schoolProfile,
}: ParentExamsExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const schoolId = schoolProfile?.id;
  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && String(schoolProfile.plan).toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || `parent-${data.student.studentCode || "guest"}`;
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));

  const hasExhaustedFreeQuota = !isPaying && quota.used >= FREE_TIER_MONTHLY_EXPORT_LIMIT;

  const handleExport = async () => {
    if (selectedFormat !== "pdf" && !isPaying) {
      toast.warning(
        "Institutional Spreadsheets (.xlsx & .csv) are reserved for Pro institutions. Please download the official PDF or upgrade your plan."
      );
      return;
    }

    if (hasExhaustedFreeQuota) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT} downloads/month). Please upgrade to institutional Pro plan for unlimited exports.`
      );
      return;
    }

    setIsExporting(true);
    try {
      if (selectedFormat === "excel") {
        exportParentExamsToExcel(data);
      } else if (selectedFormat === "csv") {
        exportParentExamsToCSV(data);
      } else {
        // PDF Export using global template
        const digitalSignatures = isPaying && schoolId ? await resolveDigitalSignatures(schoolId) : null;

        const tableHeaders = [
          "Assessment Title",
          "Subject",
          "Type",
          "Date",
          "Score / Total",
          "Pct",
          "Grade",
          "Status",
        ];

        const tableRows = (data.exams || []).map((e) => {
          const scoreStr =
            e.score !== undefined && e.totalScore !== undefined
              ? `${e.score}/${e.totalScore}`
              : e.score !== undefined
                ? `${e.score}`
                : "—";

          const pctStr =
            e.percentage !== undefined
              ? `${e.percentage}%`
              : e.score !== undefined && e.totalScore && e.totalScore > 0
                ? `${Math.round((e.score / e.totalScore) * 100)}%`
                : "—";

          return [
            e.title,
            e.subject,
            e.assessmentType,
            e.date,
            scoreStr,
            pctStr,
            e.grade || "—",
            e.status.toUpperCase(),
          ];
        });

        await generatePDF({
          title: "OFFICIAL STUDENT ACADEMIC ASSESSMENT DOSSIER",
          filename: `${data.student.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Academic_Dossier.pdf`,
          schoolProfile: {
            name: data.school?.name || schoolProfile?.name || "Connected School",
            address: data.school?.address || schoolProfile?.address,
            phone: data.school?.phone || schoolProfile?.phone,
            email: data.school?.email || schoolProfile?.email,
            logo: data.school?.logo || schoolProfile?.logo,
          },
          metaData: [
            { label: "Student Name", value: data.student.name },
            { label: "Student Code", value: data.student.studentCode || "N/A" },
            {
              label: "Class Cohort",
              value: `${data.student.className || "Classroom"} ${data.student.section ? `(${data.student.section})` : ""}`.trim(),
            },
            { label: "Parent / Guardian", value: data.student.parentName || "Parent Guardian" },
            { label: "Cumulative Average", value: `${data.summary.termAverage}%` },
            { label: "Overall Grade", value: data.summary.letterGrade },
            { label: "Attendance Rate", value: `${data.summary.attendanceRate}%` },
            { label: "Total Tracked", value: `${data.summary.totalExams} Assessments` },
          ],
          tableHeaders: [tableHeaders],
          tableData: tableRows,
          signatures: isPaying
            ? {
                right: {
                  label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
                  name: digitalSignatures?.adminName || "Head of Institution",
                  signatureUrl: digitalSignatures?.principalSigUrl,
                  subLabel: "Official Academic Dossier Endorsement",
                },
              }
            : {
                left: { label: "Form Master / Teacher", name: "Class Teacher", subLabel: "Classroom Verification" },
                right: { label: "Principal / Director", name: "Principal", subLabel: "Unendorsed Copy" },
              },
          orientation: "portrait",
        });
      }

      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      if (schoolId) {
        await dispatchExportLeadershipNotification({
          schoolId,
          actorName: data.student.name,
          actorRole: "PARENT",
          resourceTitle: `${data.student.name} Academic Assessment Dossier`,
          recordCount: data.exams.length,
          format: selectedFormat === "excel" ? "EXCEL" : selectedFormat === "csv" ? "CSV" : "PDF",
        });
      }

      toast.success(
        `Academic assessment dossier exported successfully as ${selectedFormat.toUpperCase()}`
      );
      onClose();
    } catch (err) {
      console.error("[ParentExamsExportModal] Export failed:", err);
      toast.error("Failed to generate export file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span>Export Academic Dossier</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Download an official dossier of {data.student.name}&apos;s continuous assessments, tests, and term examination grades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quota Banner */}
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
            userRole="PARENT"
          />

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* PDF Option */}
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${selectedFormat === "pdf"
                    ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
              >
                <FileText className="w-6 h-6 mb-1 text-rose-500" />
                <span className="text-xs font-semibold">PDF Document</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Formal Print</span>
              </button>

              {/* Excel Option */}
              <button
                type="button"
                onClick={() => isPaying && setSelectedFormat("excel")}
                disabled={!isPaying}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${!isPaying
                    ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                    : selectedFormat === "excel"
                      ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {!isPaying && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                    PRO
                  </span>
                )}
                <FileSpreadsheet className="w-6 h-6 mb-1 text-emerald-600" />
                <span className="text-xs font-semibold">Excel (.xlsx)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Full Data</span>
              </button>

              {/* CSV Option */}
              <button
                type="button"
                onClick={() => isPaying && setSelectedFormat("csv")}
                disabled={!isPaying}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${!isPaying
                    ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                    : selectedFormat === "csv"
                      ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {!isPaying && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                    PRO
                  </span>
                )}
                <FileSpreadsheet className="w-6 h-6 mb-1 text-blue-600" />
                <span className="text-xs font-semibold">CSV (.csv)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Raw Text</span>
              </button>
            </div>
          </div>

          {/* Student Dossier Summary Snapshot */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Candidate:</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.student.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Term Cumulative:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.summary.termAverage}% ({data.summary.letterGrade})
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Assessments Included:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.exams?.length || 0} records
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Official Leadership Endorsement:</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {isPaying ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Verified Signatures</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic">Unendorsed Copy</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto h-9 text-xs rounded-xl border-slate-200 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || hasExhaustedFreeQuota || !data}
            className="w-full sm:w-auto h-9 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs shadow-orange-600/20"
          >
            {isExporting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Download Dossier</span>
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

