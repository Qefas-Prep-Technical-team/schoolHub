"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileSpreadsheet, FileText, Calendar, Filter } from "lucide-react";
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
import { ClassItem } from "./ClassTable";
import {
  exportStudentClassesToExcel,
  exportStudentClassesToCSV,
} from "../utils/studentClassSpreadsheetExporter";

export interface StudentClassExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  schoolProfile?: any;
  schoolId?: string;
  studentName?: string;
  className?: string;
}

export function StudentClassExportModal({
  isOpen,
  onClose,
  classes,
  schoolProfile,
  schoolId,
  studentName = "Scholar",
  className = "Assigned Cohort",
}: StudentClassExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [deptFilter, setDeptFilter] = useState<"ALL" | "DEPT_ONLY" | "GENERAL">("ALL");
  const [recordLimit, setRecordLimit] = useState<"ALL" | "5" | "10" | "25" | "50">("ALL");

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const effectiveSchoolId = schoolId || schoolProfile?.id || schoolProfile?.schoolId || "";
  const quotaContextId = effectiveSchoolId || "student_classes";
  const quota = getMonthlyExportUsage(quotaContextId);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      if (deptFilter === "DEPT_ONLY" && !cls.hasDeptFilter) return false;
      if (deptFilter === "GENERAL" && cls.hasDeptFilter) return false;
      return true;
    });
  }, [classes, deptFilter]);

  const finalClassesToExport = useMemo(() => {
    if (recordLimit === "ALL") return filteredClasses;
    const limitNum = parseInt(recordLimit, 10);
    return filteredClasses.slice(0, limitNum);
  }, [filteredClasses, recordLimit]);

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Contact school administrator to upgrade institutional plan.`
      );
      return;
    }

    if (finalClassesToExport.length === 0) {
      toast.warning("No classes match the selected filter criteria to export.");
      return;
    }

    setIsExporting(true);
    const schoolName = schoolProfile?.name || "School";
    const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const dateStr = format(new Date(), "yyyy-MM-dd");

    try {
      if (selectedFormat === "excel") {
        if (!isPaying) {
          toast.error("Spreadsheet exports (.xlsx) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }
        exportStudentClassesToExcel(finalClassesToExport, studentName, schoolName);
      } else if (selectedFormat === "csv") {
        if (!isPaying) {
          toast.error("CSV exports (.csv) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }
        exportStudentClassesToCSV(finalClassesToExport, studentName, schoolName, schoolProfile?.motto);
      } else {
        // PDF Export
        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        const tableHeaders = ["#", "Class Cohort", "Primary Subject", "Curriculum Subjects", "Instructor", "Room"];
        const rows = finalClassesToExport.map((cls, idx) => [
          (idx + 1).toString(),
          cls.title || "—",
          cls.subject || "—",
          cls.subjects?.join(", ") || cls.description || "Core Module",
          cls.teacher || "Assigned Instructor",
          cls.room || "General",
        ]);

        await generatePDF({
          title: "Official Enrolled Classes Roster",
          filename: `${sanitizedSchool}_${studentName.toLowerCase().replace(/\s+/g, "_")}_classes_${dateStr}.pdf`,
          schoolProfile,
          metaData: [
            { label: "Student Name", value: studentName },
            { label: "Class Cohort", value: className },
            { label: "Total Classes", value: finalClassesToExport.length.toString() },
            { label: "Scope", value: deptFilter === "ALL" ? "All Enrolled Classes" : deptFilter === "DEPT_ONLY" ? "Department Only" : "General Curriculum" },
            { label: "Date", value: format(new Date(), "MMMM d, yyyy") },
          ],
          tableHeaders: [tableHeaders],
          tableData: rows,
          signatures: isPaying
            ? {
              right: {
                label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
                name: digitalSignatures?.adminName || schoolProfile?.principalName || "Head of Institution",
                signatureUrl: digitalSignatures?.principalSigUrl,
                subLabel: "Official Institutional Verification",
              },
            }
            : undefined,
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
          resourceTitle: `${studentName} — Enrolled Classes Roster`,
          recordCount: finalClassesToExport.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(
        `Successfully exported ${finalClassesToExport.length} class${finalClassesToExport.length === 1 ? "" : "es"
        } as ${selectedFormat.toUpperCase()}!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Student class export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate export file. Please try again.");
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
                Export Class Directory
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Download your official enrolled classrooms and curriculum schedule.
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
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Official Roster</div>
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
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Continuous Data</div>
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

          {/* Filtering Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-pink-500" />
                Department Scope
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
              >
                <option value="ALL">All Enrolled Classes</option>
                <option value="DEPT_ONLY">Department Curricula Only</option>
                <option value="GENERAL">General Curriculum Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                Record Volume
              </label>
              <select
                value={recordLimit}
                onChange={(e) => setRecordLimit(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
              >
                <option value="ALL">All ({filteredClasses.length} Classes)</option>
                <option value="5">First 5 Classes</option>
                <option value="10">First 10 Classes</option>
                <option value="25">First 25 Classes</option>
                <option value="50">First 50 Classes</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span className="font-semibold">Selected for export:</span>
            <span className="font-black text-pink-600 dark:text-pink-400">
              {finalClassesToExport.length} Classroom{finalClassesToExport.length === 1 ? "" : "s"}
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
            disabled={isExporting || (!isPaying && quota.remaining <= 0) || finalClassesToExport.length === 0}
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
