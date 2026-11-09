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
import { Loader2, Download, FileSpreadsheet, FileText } from "lucide-react";
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
import { Department } from "../services/departmentService";
import {
  exportDepartmentsToExcel,
  exportDepartmentsToCSV,
} from "../utils/departmentSpreadsheetExporter";

export interface DepartmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  schoolProfile?: any;
  schoolId?: string;
}

export function DepartmentExportModal({
  isOpen,
  onClose,
  departments,
  schoolProfile,
  schoolId,
}: DepartmentExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<string>("ALL");

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
      (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "admin_departments";
  const quota = getMonthlyExportUsage(quotaContextId);

  const filteredDepts = departments.filter((dept) => {
    if (scopeFilter === "ALL") return true;
    if (scopeFilter === "SCHOOL") return dept.scope === "SCHOOL";
    if (scopeFilter === "PERSONAL") return dept.scope === "PERSONAL";
    if (scopeFilter === "ACTIVE") return !dept.isArchived;
    if (scopeFilter === "ARCHIVED") return dept.isArchived;
    return true;
  });

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Upgrade to Pro for unlimited exports.`
      );
      return;
    }

    if (!isPaying && selectedFormat !== "pdf") {
      toast.error("Excel (.xlsx) and CSV exports require a Pro institutional subscription.");
      return;
    }

    if (filteredDepts.length === 0) {
      toast.info("No departments match your export filter.");
      return;
    }

    setIsExporting(true);
    try {
      const schoolName = schoolProfile?.name || "School";
      const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
      const dateStr = format(new Date(), "yyyy-MM-dd");

      if (selectedFormat === "excel") {
        exportDepartmentsToExcel(filteredDepts, schoolName);
      } else if (selectedFormat === "csv") {
        exportDepartmentsToCSV(filteredDepts, schoolName, schoolProfile?.motto);
      } else {
        const headers = ["#", "Department Name", "Code", "Subjects", "Classes", "Students", "Scope", "Status"];
        const rows = filteredDepts.map((d, index) => [
          (index + 1).toString(),
          d.name || "N/A",
          d.code || "N/A",
          (d.subjects?.length || 0).toString(),
          (d._count?.classes || 0).toString(),
          (d._count?.students || 0).toString(),
          d.scope === "SCHOOL" ? "School-wide" : "Personal",
          d.isArchived ? "Archived" : "Active",
        ]);

        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        await generatePDF({
          title: "School Departments Catalog & Faculty Directory",
          filename: `${sanitizedSchool}_departments_export_${dateStr}.pdf`,
          schoolProfile,
          metaData: [
            { label: "Date", value: dateStr },
            { label: "Total Departments", value: filteredDepts.length.toString() },
            { label: "Scope Filter", value: scopeFilter },
            { label: "Endorsement Status", value: isPaying ? "Digitally Endorsed" : "Standard Summary" },
          ],
          tableHeaders: [headers],
          tableData: rows,
          signatures: digitalSignatures?.principalSigUrl
            ? {
                left: {
                  label: "Dean / Academic Board",
                  name: digitalSignatures.adminName || "Academic Affairs",
                  signatureUrl: undefined,
                  subLabel: "Departmental Division",
                },
                right: {
                  label: digitalSignatures.adminTitle || "Principal / Head of Institution",
                  name: digitalSignatures.adminName || "Head of Institution",
                  signatureUrl: digitalSignatures.principalSigUrl,
                  subLabel: "Institutional Endorsement",
                },
              }
            : undefined,
        });
      }

      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
      }

      if (schoolId) {
        dispatchExportLeadershipNotification({
          schoolId,
          actorName: "Administrator",
          actorRole: "ADMIN",
          resourceTitle: "Official Departments Directory Report",
          recordCount: filteredDepts.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(
        `Departments catalog exported successfully as ${selectedFormat.toUpperCase()}!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Department export error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to export departments directory."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="size-5 text-blue-600 dark:text-blue-400" />
            Export School Departments
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Download verified department directories, subject distribution, and class rosters in institutional formats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
          />

          {/* Scope Filtering */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Department Scope
            </label>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              <option value="SCHOOL">School-wide Only</option>
              <option value="PERSONAL">Personal / Teacher Scope</option>
              <option value="ACTIVE">Active Only</option>
              <option value="ARCHIVED">Archived Only</option>
            </select>
          </div>

          {/* Export Format Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-center cursor-pointer ${
                  selectedFormat === "pdf"
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <FileText className="size-6 text-red-500" />
                <span className="text-xs font-bold">PDF Document</span>
              </button>

              <button
                type="button"
                onClick={() => isPaying && setSelectedFormat("excel")}
                disabled={!isPaying}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-center relative ${
                  !isPaying
                    ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400"
                    : selectedFormat === "excel"
                    ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs cursor-pointer"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer"
                }`}
              >
                {!isPaying && (
                  <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-[9px] font-black uppercase text-white shadow-xs">
                    PRO
                  </span>
                )}
                <FileSpreadsheet className="size-6 text-emerald-600" />
                <span className="text-xs font-bold">Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => isPaying && setSelectedFormat("csv")}
                disabled={!isPaying}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-center relative ${
                  !isPaying
                    ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400"
                    : selectedFormat === "csv"
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs cursor-pointer"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer"
                }`}
              >
                {!isPaying && (
                  <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-[9px] font-black uppercase text-white shadow-xs">
                    PRO
                  </span>
                )}
                <FileSpreadsheet className="size-6 text-indigo-600" />
                <span className="text-xs font-bold">CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Export preview count */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Departments to Export:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredDepts.length} of {departments.length}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || (!isPaying && quota.remaining <= 0) || filteredDepts.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="size-4" />
                <span>Generate Export</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

