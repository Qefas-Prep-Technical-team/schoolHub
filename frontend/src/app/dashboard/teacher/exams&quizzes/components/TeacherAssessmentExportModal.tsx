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
import { Loader2, Download, FileSpreadsheet, FileText, Calendar, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { format, subDays, isAfter } from "date-fns";
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
  AssessmentExportItem,
  exportTeacherAssessmentsToExcel,
  exportTeacherAssessmentsToCSV,
} from "../utils/teacherAssessmentSpreadsheetExporter";

export interface TeacherAssessmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessments: AssessmentExportItem[];
  classes?: Array<{ id: string; name: string }>;
  activeTabLabel?: string;
  schoolProfile?: any;
  schoolId?: string;
  teacherName?: string;
}

export function TeacherAssessmentExportModal({
  isOpen,
  onClose,
  assessments,
  classes = [],
  activeTabLabel = "Assessments",
  schoolProfile,
  schoolId,
  teacherName = "Faculty Teacher",
}: TeacherAssessmentExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<"ALL" | "7_DAYS" | "30_DAYS" | "90_DAYS" | "THIS_SESSION">("ALL");
  const [recordLimit, setRecordLimit] = useState<"ALL" | "10" | "25" | "50" | "100" | "CUSTOM">("ALL");
  const [customLimit, setCustomLimit] = useState<number>(25);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const effectiveSchoolId = schoolId || schoolProfile?.id || schoolProfile?.schoolId || "";
  const quotaContextId = effectiveSchoolId || "teacher_assessments";
  const quota = getMonthlyExportUsage(quotaContextId);

  const filteredList = useMemo(() => {
    return assessments.filter((item) => {
      if (classFilter !== "ALL") {
        const itemClassId = item.classId || item.class?.id;
        if (itemClassId !== classFilter) return false;
      }

      if (statusFilter !== "ALL") {
        if ((item.status || "DRAFT").toUpperCase() !== statusFilter) return false;
      }

      if (dateRange !== "ALL") {
        const itemDate = item.createdAt || item.startDate || item.updatedAt;
        if (itemDate) {
          const parsed = new Date(itemDate);
          if (!isNaN(parsed.getTime())) {
            const now = new Date();
            if (dateRange === "7_DAYS" && !isAfter(parsed, subDays(now, 7))) return false;
            if (dateRange === "30_DAYS" && !isAfter(parsed, subDays(now, 30))) return false;
            if (dateRange === "90_DAYS" && !isAfter(parsed, subDays(now, 90))) return false;
            if (dateRange === "THIS_SESSION" && !isAfter(parsed, subDays(now, 365))) return false;
          }
        }
      }

      return true;
    });
  }, [assessments, classFilter, statusFilter, dateRange]);

  const finalItemsToExport = useMemo(() => {
    if (recordLimit === "ALL") return filteredList;
    const limitNum = recordLimit === "CUSTOM" ? Math.max(1, customLimit) : parseInt(recordLimit, 10);
    return filteredList.slice(0, limitNum);
  }, [filteredList, recordLimit, customLimit]);

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Contact administrator to upgrade institutional plan.`
      );
      return;
    }

    if (!isPaying && selectedFormat !== "pdf") {
      toast.error("Excel (.xlsx) and CSV exports require a Pro institutional plan.");
      return;
    }

    if (finalItemsToExport.length === 0) {
      toast.info("No assessments match your selected criteria.");
      return;
    }

    setIsExporting(true);
    try {
      const schoolName = schoolProfile?.name || "School";
      const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
      const dateStr = format(new Date(), "yyyy-MM-dd");

      if (selectedFormat === "excel") {
        exportTeacherAssessmentsToExcel(finalItemsToExport, schoolName, activeTabLabel);
      } else if (selectedFormat === "csv") {
        exportTeacherAssessmentsToCSV(finalItemsToExport, schoolName, activeTabLabel, schoolProfile?.motto);
      } else {
        const headers = ["#", "Title", "Category", "Subject", "Class", "Marks", "Duration", "Status", "Date"];
        const rows = finalItemsToExport.map((item, idx) => {
          let dateStrRow = "-";
          const rawDate = item.createdAt || item.startDate || item.updatedAt;
          if (rawDate) {
            try {
              const p = new Date(rawDate as string | Date);
              if (!isNaN(p.getTime())) dateStrRow = format(p, "dd/MM/yyyy");
            } catch {}
          }
          return [
            (idx + 1).toString(),
            item.title || item.name || "Untitled",
            item.category || (item._tabType ? item._tabType.toUpperCase() : item.type ? item.type.toUpperCase() : "EXAM"),
            item.subject?.name || item.subjectExamPapers?.[0]?.subjectPaper?.subject?.name || "-",
            item.class?.name || classes.find(c => c.id === item.classId)?.name || "-",
            item.totalMarks !== undefined ? item.totalMarks.toString() : "-",
            item.durationMinutes ? `${item.durationMinutes}m` : "-",
            (item.status || "DRAFT").toUpperCase(),
            dateStrRow,
          ];
        });

        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        await generatePDF({
          title: `${schoolName} - ${activeTabLabel} Directory`,
          filename: `${sanitizedSchool}_${activeTabLabel.replace(/\s+/g, "_")}_${dateStr}.pdf`,
          schoolProfile,
          metaData: [
            { label: "Category", value: activeTabLabel },
            { label: "Class Filter", value: classFilter === "ALL" ? "All Classes" : (classes.find(c => c.id === classFilter)?.name || classFilter) },
            { label: "Status Filter", value: statusFilter === "ALL" ? "All Statuses" : statusFilter },
            { label: "Date Range", value: dateRange === "ALL" ? "All Time" : dateRange.replace("_", " ") },
            { label: "Total Exported", value: `${finalItemsToExport.length} assessments` },
            { label: "Faculty Member", value: teacherName },
            { label: "Export Date", value: format(new Date(), "MMMM d, yyyy") },
          ],
          tableHeaders: [headers],
          tableData: rows,
          orientation: "landscape",
          signatures: {
            left: {
              label: "Subject Teacher / Faculty",
              name: teacherName || "Assigned Teacher",
              signatureUrl: undefined,
              subLabel: "Academic Authoring",
            },
            right: {
              label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
              name: digitalSignatures?.adminName || schoolProfile?.principalName || "Head of Institution",
              signatureUrl: digitalSignatures?.principalSigUrl,
              subLabel: "Institutional Endorsement",
            },
          },
        });
      }

      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
      }

      if (effectiveSchoolId) {
        dispatchExportLeadershipNotification({
          schoolId: effectiveSchoolId,
          actorName: teacherName,
          actorRole: "TEACHER",
          resourceTitle: `${activeTabLabel} Academic Directory`,
          recordCount: finalItemsToExport.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(
        `${activeTabLabel} (${finalItemsToExport.length} records) exported successfully as ${selectedFormat.toUpperCase()}!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Assessment export error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to export assessment records."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                Export {activeTabLabel}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Generate official academic assessment catalogs with dual leadership endorsements.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Quota Banner */}
          <ExportQuotaBanner 
            isPaying={isPaying} 
            used={quota.used} 
            limit={quota.limit} 
            remaining={quota.remaining} 
            userRole="TEACHER"
          />

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "pdf", label: "PDF Document", ext: ".pdf", icon: FileText, color: "text-rose-500" },
                { id: "excel", label: "Excel Sheet", ext: ".xlsx", icon: FileSpreadsheet, color: "text-emerald-500", pro: true },
                { id: "csv", label: "CSV Data", ext: ".csv", icon: FileSpreadsheet, color: "text-blue-500", pro: true },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;
                const isLocked = fmt.pro && !isPaying;

                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      if (isLocked) {
                        toast.info("Excel and CSV formats are reserved for institutional pro plans.");
                        return;
                      }
                      setSelectedFormat(fmt.id as "pdf" | "excel" | "csv");
                    }}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                    } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${fmt.color}`} />
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{fmt.label}</div>
                    <div className="text-[10px] text-slate-400">{fmt.ext}</div>
                    {isLocked && (
                      <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Pro
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Class Filter */}
            {classes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Target Class
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">All Classes ({assessments.length})</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Status Scope
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published / Live</option>
                <option value="DRAFT">Drafts</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Date Duration / Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Duration / Date Window
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: "ALL", label: "All Time" },
                { id: "7_DAYS", label: "Past 7d" },
                { id: "30_DAYS", label: "Past 30d" },
                { id: "90_DAYS", label: "Past 90d" },
                { id: "THIS_SESSION", label: "Session (1y)" },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setDateRange(range.id as any)}
                  className={`px-2.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    dateRange === range.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Record Limit Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Number of Assessments to Export
              </label>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {finalItemsToExport.length} of {filteredList.length} selected
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: "ALL", label: "All" },
                { id: "10", label: "10" },
                { id: "25", label: "25" },
                { id: "50", label: "50" },
                { id: "100", label: "100" },
                { id: "CUSTOM", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRecordLimit(opt.id as any)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    recordLimit === opt.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {recordLimit === "CUSTOM" && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={filteredList.length || 1000}
                  value={customLimit}
                  onChange={(e) => setCustomLimit(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-28 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g. 15"
                />
                <span className="text-xs text-slate-500">records limit</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting || finalItemsToExport.length === 0}
            onClick={handleExport}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedFormat.toUpperCase()} ({finalItemsToExport.length})</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
