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
import * as XLSX from "xlsx";
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

export interface SubjectPerformanceItem {
  name: string;
  teacher: string;
  average: number;
  grade: string;
  tier: string;
  assessmentsCount: number;
}

export interface ParentSubjectPerformanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentCode: string;
  className: string;
  deptName: string;
  schoolProfile?: any;
  schoolId?: string;
  subjects: SubjectPerformanceItem[];
}

function escapeCSV(val: string | number | null | undefined): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ParentSubjectPerformanceExportModal({
  isOpen,
  onClose,
  studentName,
  studentCode,
  className,
  deptName,
  schoolProfile,
  schoolId,
  subjects,
}: ParentSubjectPerformanceExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && String(schoolProfile.plan).toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || schoolProfile?.id || "parent-quota-subject-performance";
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));

  const hasExhaustedFreeQuota = !isPaying && quota.remaining <= 0;

  const handleExport = async () => {
    if (!subjects || subjects.length === 0) return;

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
        const wb = XLSX.utils.book_new();
        const titleRows = [
          [(schoolProfile?.name || "School Portal").toUpperCase()],
          [`SUBJECT MASTERY & CURRICULUM PERFORMANCE REPORT`],
          [`Student Name: ${studentName} | Student ID: ${studentCode}`],
          [`Class Cohort: ${className} | Department: ${deptName}`],
          [`Generated Date: ${new Date().toLocaleDateString()}`],
          [],
        ];

        const headers = ["#", "Subject Name", "Faculty Instructor", "Average (%)", "Grade", "Mastery Tier", "Evaluations"];
        const rows = subjects.map((s, idx) => [
          idx + 1,
          s.name,
          s.teacher,
          `${s.average}%`,
          s.grade,
          s.tier,
          s.assessmentsCount,
        ]);

        const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);
        ws["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, ws, "Subject Performance");
        XLSX.writeFile(wb, `${studentName.replace(/\s+/g, "_")}_Subject_Performance.xlsx`);
      } else if (selectedFormat === "csv") {
        const metaLines = [
          `# SCHOOL: ${escapeCSV(schoolProfile?.name || "School Portal")}`,
          `# REPORT: SUBJECT MASTERY & CURRICULUM PERFORMANCE REPORT`,
          `# STUDENT: ${escapeCSV(studentName)} (${escapeCSV(studentCode)})`,
          `# CLASS: ${escapeCSV(className)} | DEPT: ${escapeCSV(deptName)}`,
          `# GENERATED: ${escapeCSV(new Date().toLocaleDateString())}`,
          "",
        ];

        const headers = ["#", "Subject Name", "Faculty Instructor", "Average (%)", "Grade", "Mastery Tier", "Evaluations"].map(escapeCSV).join(",");
        const dataLines = subjects.map((s, idx) =>
          [idx + 1, s.name, s.teacher, `${s.average}%`, s.grade, s.tier, s.assessmentsCount].map(escapeCSV).join(",")
        );

        const csvContent = [...metaLines, headers, ...dataLines].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${studentName.replace(/\s+/g, "_")}_Subject_Performance.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // PDF Export
        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        const tableHeaders = [
          ["#", "Subject Course", "Instructor / Faculty", "Average (%)", "Grade", "Proficiency Tier", "Assessments Logged"],
        ];

        const tableData = subjects.map((s, idx) => [
          String(idx + 1),
          s.name,
          s.teacher,
          `${s.average}%`,
          s.grade,
          s.tier,
          String(s.assessmentsCount),
        ]);

        const metaData = [
          { label: "Student Name", value: studentName },
          { label: "Student ID", value: studentCode },
          { label: "Class Cohort", value: className },
          { label: "Curriculum Division", value: deptName },
          { label: "Total Subjects Evaluated", value: `${subjects.length} Course Units` },
          { label: "Export Date", value: new Date().toLocaleDateString() },
        ];

        const safeStudent = studentName.replace(/\s+/g, "_");

        await generatePDF({
          title: `CURRICULUM SUBJECT MASTERY REPORT — ${studentName.toUpperCase()}`,
          filename: `${safeStudent}_Subject_Mastery_Report.pdf`,
          schoolProfile,
          metaData,
          tableHeaders,
          tableData,
          signatures: isPaying
            ? {
              right: {
                label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
                name: digitalSignatures?.adminName || schoolProfile?.principalName || "Head of Institution",
                signatureUrl: digitalSignatures?.principalSigUrl,
                subLabel: "Official Academic Dossier Endorsement",
              },
            }
            : {
              left: { label: "Department Dean", name: "—", subLabel: "Curriculum Verification" },
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
          actorName: studentName,
          actorRole: "PARENT",
          resourceTitle: "Subject Mastery Performance Report",
          recordCount: subjects.length,
          format: selectedFormat === "excel" ? "EXCEL" : selectedFormat === "csv" ? "CSV" : "PDF",
        });
      }

      toast.success(`Academic report exported successfully as ${selectedFormat.toUpperCase()}`);
      onClose();
    } catch (err) {
      console.error("[ParentSubjectPerformanceExportModal] Export failed:", err);
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
            <span>Export Subject Mastery Report</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            Download curriculum mastery analytics, course scores, and teacher evaluations for {studentName}.
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${selectedFormat === "pdf"
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative ${selectedFormat === "excel"
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
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative ${selectedFormat === "csv"
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
            disabled={isExporting || hasExhaustedFreeQuota || subjects.length === 0}
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

