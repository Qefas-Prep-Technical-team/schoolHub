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
import {
  AssignmentExportItem,
  exportAssignmentsToExcel,
  exportAssignmentsToCSV,
} from "../utils/assignmentSpreadsheetExporter";

export interface AssignmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: any[];
  schoolProfile?: any;
  schoolId?: string;
}

export function AssignmentExportModal({
  isOpen,
  onClose,
  assignments,
  schoolProfile,
  schoolId,
}: AssignmentExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "admin_assignments";
  const quota = getMonthlyExportUsage(quotaContextId);

  const filteredAssignments: AssignmentExportItem[] = assignments
    .filter((a: any) => {
      if (statusFilter === "ALL") return true;
      return (a.status || "DRAFT").toUpperCase() === statusFilter;
    })
    .map((assignment: any) => {
      const totalStudents =
        typeof assignment.totalTargetedStudents === "number"
          ? assignment.totalTargetedStudents
          : typeof assignment.class === "object" && assignment.class?._count?.enrollments
            ? assignment.class._count.enrollments
            : 0;
      const submitted = assignment._count?.submissions || 0;
      const progress = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;

      return {
        id: assignment.id,
        title: assignment.title || "Untitled",
        subjectName:
          typeof assignment.subject === "string"
            ? assignment.subject
            : assignment.subject?.name || "General",
        className:
          typeof assignment.class === "string"
            ? assignment.class
            : assignment.class?.name || "All Classes",
        dueDate: assignment.dueDate,
        progressPercentage: progress,
        totalStudents,
        submittedCount: submitted,
        status: assignment.status || "DRAFT",
      };
    });

  const handleExecuteExport = async () => {
    if (!isPaying && quota.used >= FREE_TIER_MONTHLY_EXPORT_LIMIT) {
      toast.error(
        `Monthly export limit reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/month). Upgrade to Pro for unlimited exports.`
      );
      return;
    }

    if (filteredAssignments.length === 0) {
      toast.info("No assignments found for the selected status filter.");
      return;
    }

    setIsExporting(true);
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const schoolName = schoolProfile?.name || "School";

    try {
      if (selectedFormat === "excel") {
        if (!isPaying) {
          toast.info("Excel spreadsheet exports are exclusive to institutional Pro plans.");
          return;
        }
        exportAssignmentsToExcel(filteredAssignments, schoolName);
      } else if (selectedFormat === "csv") {
        if (!isPaying) {
          toast.info("CSV spreadsheet exports are exclusive to institutional Pro plans.");
          return;
        }
        exportAssignmentsToCSV(filteredAssignments, schoolName);
      } else {
        // PDF Export with digital signatures
        const headers = ["#", "Title", "Subject", "Class", "Deadline", "Progress", "Status"];
        const rows = filteredAssignments.map((a, index) => [
          (index + 1).toString(),
          a.title,
          a.subjectName || "General",
          a.className || "All Classes",
          a.dueDate ? format(new Date(a.dueDate), "yyyy-MM-dd") : "No Deadline",
          `${a.submittedCount}/${a.totalStudents} (${a.progressPercentage}%)`,
          a.status.toUpperCase(),
        ]);

        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        await generatePDF({
          title: "Official Academic Assignments Directory",
          filename: `${schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_")}_assignments_${dateStr}.pdf`,
          schoolProfile: schoolProfile,
          metaData: [
            { label: "Date", value: format(new Date(), "MMMM d, yyyy") },
            { label: "Status Scope", value: statusFilter },
            { label: "Total Assignments", value: filteredAssignments.length.toString() },
          ],
          tableHeaders: [headers],
          tableData: rows,
          signatures: digitalSignatures?.principalSigUrl
            ? {
              left: {
                label: "Academic Coordinator",
                name: digitalSignatures.adminName || "Academic Division",
                signatureUrl: undefined,
                subLabel: "Coordinator Signoff",
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
          resourceTitle: "Assignments Directory Report",
          recordCount: filteredAssignments.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(`Assignments exported successfully as ${selectedFormat.toUpperCase()}!`);
      onClose();
    } catch (err) {
      console.error("Assignment export error:", err);
      toast.error(`Failed to export assignments as ${selectedFormat.toUpperCase()}.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-[#1a1b2e] dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            Export Assignments Directory
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Export academic assignment rosters in official PDF, Excel (.xlsx), or CSV (.csv).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quota Banner */}
          <ExportQuotaBanner
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
            isPaying={isPaying}
          />

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="ALL">All Statuses ({assignments.length})</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
              <option value="CLOSED">Closed Only</option>
            </select>
          </div>

          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedFormat === "pdf"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <FileText className="w-5 h-5 mb-1" />
                PDF Document
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("excel")}
                disabled={!isPaying}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative cursor-pointer ${selectedFormat === "excel"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  }`}
              >
                <FileSpreadsheet className="w-5 h-5 mb-1" />
                Excel (.xlsx)
                {!isPaying && (
                  <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-white rounded font-bold uppercase mt-0.5">
                    PRO
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("csv")}
                disabled={!isPaying}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative cursor-pointer ${selectedFormat === "csv"
                    ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 text-teal-600"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  }`}
              >
                <Download className="w-5 h-5 mb-1" />
                CSV (.csv)
                {!isPaying && (
                  <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-white rounded font-bold uppercase mt-0.5">
                    PRO
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export {filteredAssignments.length} Records</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
