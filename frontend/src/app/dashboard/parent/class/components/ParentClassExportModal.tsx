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
  ParentClassDossierData,
  exportParentClassToExcel,
  exportParentClassToCSV,
} from "../utils/parentClassSpreadsheetExporter";

export interface ParentClassExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ParentClassDossierData | null;
  schoolProfile?: any;
  schoolId?: string;
}

export function ParentClassExportModal({
  isOpen,
  onClose,
  data,
  schoolProfile,
  schoolId,
}: ParentClassExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
      (schoolProfile?.plan && String(schoolProfile.plan).toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "parent-quota-class-overview";
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
      if (selectedFormat === "excel") {
        exportParentClassToExcel(data);
      } else if (selectedFormat === "csv") {
        exportParentClassToCSV(data);
      } else {
        // PDF Export
        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        const tableHeaders = [
          ["#", "Subject Code", "Course Title", "Instructor / Faculty", "Department", "Credit Units"],
        ];

        const tableData = data.subjects.map((s, idx) => [
          String(idx + 1),
          s.code,
          s.name,
          s.teacher,
          s.department,
          String(s.creditUnits),
        ]);

        const metaData = [
          { label: "Classroom Cohort", value: `${data.className} ${data.section ? `• Section ${data.section}` : ""}` },
          { label: "Enrolled Student", value: `${data.studentName} (${data.studentCode})` },
          { label: "Academic Session", value: data.session || "N/A" },
          { label: "Academic Term", value: data.term || "N/A" },
          { label: "Lead Class Teacher", value: data.leadTeacher },
          { label: "Total Enrolled Cohort", value: `${data.totalStudents} Students` },
          { label: "Cohort Attendance", value: `${data.attendanceRate}% Consistency` },
          { label: "Average Performance", value: `${data.averageGrade}% (Grade ${data.letterGrade} - ${data.standingRemark})` },
          { label: "Export Date", value: new Date().toLocaleDateString() },
        ];

        const safeClass = data.className.replace(/\s+/g, "_");

        await generatePDF({
          title: `CLASSROOM COHORT & CURRICULUM DOSSIER — ${data.className.toUpperCase()}`,
          filename: `${safeClass}_Classroom_Dossier.pdf`,
          schoolProfile,
          metaData,
          tableHeaders,
          tableData,
          signatures: isPaying
            ? {
                right: {
                  label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
                  name: digitalSignatures?.adminName || "Head of Institution",
                  signatureUrl: digitalSignatures?.principalSigUrl,
                  subLabel: "Official Classroom Verification",
                },
              }
            : {
                left: { label: "Class Master / Teacher", name: data.leadTeacher, subLabel: "Classroom Verification" },
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
      if (schoolId || schoolProfile?.id) {
        await dispatchExportLeadershipNotification({
          schoolId: schoolId || schoolProfile?.id,
          actorName: data.studentName,
          actorRole: "PARENT",
          resourceTitle: `Classroom Dossier: ${data.className}`,
          recordCount: data.subjects.length,
          format: selectedFormat === "excel" ? "EXCEL" : selectedFormat === "csv" ? "CSV" : "PDF",
        });
      }

      toast.success(`Class dossier exported successfully as ${selectedFormat.toUpperCase()}`);
      onClose();
    } catch (err) {
      console.error("[ParentClassExportModal] Export failed:", err);
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
            <span>Export Classroom Dossier</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            Download complete curriculum syllabus, course teachers, and cohort averages for {data?.className || "class"}.
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

