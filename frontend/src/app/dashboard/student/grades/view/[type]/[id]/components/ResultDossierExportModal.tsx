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
import { format } from "date-fns";
import { generatePDF } from "@/utils/pdfGenerator";
import { isSchoolOnPayingPlan } from "@/utils/subscriptionPlanCheck";
import {
  getMonthlyExportUsage,
  incrementMonthlyExportUsage,
  FREE_TIER_MONTHLY_EXPORT_LIMIT,
} from "@/utils/exportQuotaManager";
import { dispatchExportLeadershipNotification } from "@/lib/api/services/exportNotificationService";
import { resolveDigitalSignatures } from "@/app/dashboard/admin/grades/utils/signatureResolver";
import { ExportQuotaBanner } from "@/app/dashboard/admin/grades/components/export/ExportQuotaBanner";
import {
  type ResultDossierExportData,
  exportResultDossierToExcel,
  exportResultDossierToCSV,
} from "../../../../utils/resultDossierSpreadsheetExporter";

export {
  type ResultDossierExportData,
  exportResultDossierToExcel,
  exportResultDossierToCSV,
};

export interface ResultDossierExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResultDossierExportData | null;
  schoolProfile?: any;
  schoolId?: string;
}

export function ResultDossierExportModal({
  isOpen,
  onClose,
  data,
  schoolProfile,
  schoolId,
}: ResultDossierExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const effectiveSchoolId = schoolId || schoolProfile?.id || schoolProfile?.schoolId || "";
  const quotaContextId = effectiveSchoolId || "student_result_dossier";
  const quota = getMonthlyExportUsage(quotaContextId);

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Contact school administrator to upgrade institutional plan.`
      );
      return;
    }

    if (!data) {
      toast.warning("No assessment result data available to export.");
      return;
    }

    setIsExporting(true);
    const schoolName = schoolProfile?.name || "Official Academic Institution";
    const studentName = data.student.name || "Student";
    const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const sanitizedTitle = data.title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const dateStr = format(new Date(), "yyyy-MM-dd");

    try {
      if (selectedFormat === "excel") {
        if (!isPaying) {
          toast.error("Spreadsheet exports (.xlsx) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }
        exportResultDossierToExcel(data, schoolName);
      } else if (selectedFormat === "csv") {
        if (!isPaying) {
          toast.error("CSV exports (.csv) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }
        exportResultDossierToCSV(data, schoolName, schoolProfile?.motto);
      } else {
        // PDF Export
        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        const tableHeaders = [
          ["#", "Subject Component", "Score", "Total", "Percentage", "Grade", "Performance Status"],
        ];
        const tableData = data.subjects.map((s: ResultDossierExportData["subjects"][number], idx: number) => [
          (idx + 1).toString(),
          s.name,
          s.score.toString(),
          s.total.toString(),
          `${s.percentage}%`,
          s.grade,
          s.remark,
        ]);

        const additionalTables = data.performanceInsight ? [
          {
            title: "Institutional Performance Feedback & Academic Remarks",
            headers: [["Evaluation Component", "Remark / Diagnostic Finding"]],
            data: [
              ["Academic Performance Insights", data.performanceInsight],
            ],
          },
        ] : undefined;

        await generatePDF({
          title: `${data.title.toUpperCase()} — RESULT DOSSIER`,
          filename: `${sanitizedSchool}_${sanitizedStudent}_${sanitizedTitle}_${dateStr}.pdf`,
          schoolProfile,
          metaData: [
            { label: "Student Name", value: studentName },
            { label: "Student ID", value: data.student.studentCode || "N/A" },
            { label: "Class / Grade", value: data.student.class || "Enrolled Class" },
            { label: "Assessment Date", value: data.submittedAt ? format(new Date(data.submittedAt), "PPpp") : format(new Date(), "PPpp") },
            { label: "Assessment Title", value: data.title },
            { label: "Category", value: data.category },
            { label: "Total Score", value: `${data.totalScore} / ${data.totalMarks}` },
            { label: "Percentage", value: data.percentage !== null ? `${data.percentage}%` : "N/A" },
            { label: "Grade Awarded", value: data.overallGrade },
          ],
          tableHeaders,
          tableData,
          additionalTables,
          signatures: isPaying
            ? {
              right: {
                label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
                name: digitalSignatures?.adminName || schoolProfile?.principalName || "Head of Institution",
                signatureUrl: digitalSignatures?.principalSigUrl,
                subLabel: "Verified Marksheet Endorsement",
              },
            }
            : undefined,
          orientation: "portrait",
        });
      }

      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
      }

      if (effectiveSchoolId) {
        dispatchExportLeadershipNotification({
          schoolId: effectiveSchoolId,
          actorName: studentName,
          actorRole: "STUDENT",
          resourceTitle: `${studentName} — ${data.title} Dossier`,
          recordCount: data.subjects.length || 1,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(`Successfully exported dossier as ${selectedFormat.toUpperCase()}!`);
      onClose();
    } catch (err: unknown) {
      console.error("Result dossier export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate result dossier.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isExporting && onClose()}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Export Result Dossier
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Official statement of assessment marks, score breakdown, and evaluator remarks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quota Banner */}
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
          />

          {/* Format Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${selectedFormat === "pdf"
                    ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-100 dark:bg-pink-900/40 px-1.5 py-0.5 rounded">
                    Universal
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">PDF Record</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Official Dossier</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!isPaying}
                onClick={() => isPaying && setSelectedFormat("excel")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${!isPaying
                    ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800"
                    : selectedFormat === "excel"
                      ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20 cursor-pointer"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {!isPaying ? (
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                      .XLSX
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Excel Sheet</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Itemized Marks</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!isPaying}
                onClick={() => isPaying && setSelectedFormat("csv")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${!isPaying
                    ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800"
                    : selectedFormat === "csv"
                      ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20 cursor-pointer"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {!isPaying ? (
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                      .CSV
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">CSV File</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">RFC Tabular</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span className="font-semibold">Assessment Title:</span>
            <span className="font-black text-pink-600 dark:text-pink-400 truncate max-w-[260px]">
              {data?.title}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto h-11 px-5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || (!isPaying && quota.remaining <= 0) || !data}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {selectedFormat.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
