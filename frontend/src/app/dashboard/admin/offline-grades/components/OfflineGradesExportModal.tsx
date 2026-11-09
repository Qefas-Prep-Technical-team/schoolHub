"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { signatureService } from "@/lib/api/services/signatureService";
import { ExportQuotaBanner } from "@/app/dashboard/admin/grades/components/export/ExportQuotaBanner";
import { computeGradePill } from "@/utils/gradingSystem";
import { GradeBatchSummary } from "../types";
import {
  exportOfflineGradesToExcel,
  exportOfflineGradesToCSV,
} from "../utils/offlineGradeSpreadsheetExporter";

export interface OfflineGradesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: GradeBatchSummary[];
  singleRecord?: GradeBatchSummary | null;
  className?: string;
  categoryLabel?: string;
  schoolProfile?: any;
  schoolId?: string;
  teacherName?: string;
  teacherId?: string;
  isTeacher?: boolean;
  gradingSystem?: any[];
}

export function OfflineGradesExportModal({
  isOpen,
  onClose,
  records,
  singleRecord,
  className,
  categoryLabel,
  schoolProfile,
  schoolId,
  teacherName = "Teacher",
  teacherId,
  isTeacher = false,
  gradingSystem,
}: OfflineGradesExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<"ALL" | "7_DAYS" | "30_DAYS" | "90_DAYS" | "THIS_SESSION">("ALL");
  const [recordLimit, setRecordLimit] = useState<"ALL" | "10" | "25" | "50" | "100" | "CUSTOM">("ALL");
  const [customLimit, setCustomLimit] = useState<number>(20);
  const [teacherSignatureUrl, setTeacherSignatureUrl] = useState<string | undefined>(undefined);

  // Load teacher's signature when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen && teacherId) {
      signatureService
        .getActiveSignature(teacherId)
        .then((sig) => {
          if (isMounted && sig?.signedUrl) {
            setTeacherSignatureUrl(sig.signedUrl);
          }
        })
        .catch(() => { });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, teacherId]);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const effectiveSchoolId = schoolId || schoolProfile?.id || schoolProfile?.schoolId || "";
  const quotaContextId = effectiveSchoolId || "offline_grades";
  const quota = getMonthlyExportUsage(quotaContextId);

  // If a single marksheet record was triggered for export, scope strictly to it
  const baseRecords = useMemo(() => {
    if (singleRecord) return [singleRecord];
    return records;
  }, [singleRecord, records]);

  // 1. Status and Date Range Filtering
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r) => {
      // Status check
      if (statusFilter !== "ALL" && (r.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Date Range check
      if (dateRange !== "ALL") {
        const itemDate = r.createdAt || r.updatedAt;
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
  }, [baseRecords, statusFilter, dateRange]);

  // 2. Data Limit Slicing
  const finalRecordsToExport = useMemo(() => {
    if (recordLimit === "ALL") return filteredRecords;
    const limitNum = recordLimit === "CUSTOM" ? Math.max(1, customLimit) : parseInt(recordLimit, 10);
    return filteredRecords.slice(0, limitNum);
  }, [filteredRecords, recordLimit, customLimit]);

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Upgrade your school plan for unlimited exports.`
      );
      return;
    }

    if (!isPaying && selectedFormat !== "pdf") {
      toast.error("Excel (.xlsx) and CSV exports require a Pro institutional plan.");
      return;
    }

    if (finalRecordsToExport.length === 0) {
      toast.info("No offline marksheet records match your filter criteria.");
      return;
    }

    setIsExporting(true);
    try {
      const schoolName = schoolProfile?.name || "School";
      const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
      const dateStr = format(new Date(), "yyyy-MM-dd");

      if (selectedFormat === "excel") {
        exportOfflineGradesToExcel(finalRecordsToExport, schoolName, gradingSystem, {
          className,
          category: categoryLabel,
        });
      } else if (selectedFormat === "csv") {
        exportOfflineGradesToCSV(finalRecordsToExport, schoolName, gradingSystem, schoolProfile?.motto, {
          className,
          category: categoryLabel,
        });
      } else {
        // PDF Export
        const digitalSignatures = await resolveDigitalSignatures(schoolProfile, true);

        // Teacher signature resolution
        let finalTeacherSig = teacherSignatureUrl;
        if (!finalTeacherSig && typeof window !== "undefined" && teacherId) {
          try {
            const cached =
              localStorage.getItem(`schoolhub_signature_${teacherId}`) ||
              localStorage.getItem("schoolhub_signature_active");
            if (cached) {
              finalTeacherSig = JSON.parse(cached)?.signedUrl;
            }
          } catch { }
        }

        const headers = [
          "#",
          "Date Recorded",
          "Assessment Title",
          "Subject Curriculum",
          "Class",
          "Category",
          "Graded",
          "Average",
          "Grade",
          "Status",
        ];

        const rows = finalRecordsToExport.map((r, idx) => {
          let dateRecorded = "-";
          if (r.createdAt || r.updatedAt) {
            try {
              const parsed = new Date(r.createdAt || r.updatedAt);
              if (!isNaN(parsed.getTime())) {
                dateRecorded = format(parsed, "yyyy-MM-dd");
              }
            } catch { }
          }

          const pct = r.maxMarks > 0 ? Math.round((r.averageScore / r.maxMarks) * 100) : 0;
          const gradePill = computeGradePill(pct, gradingSystem);

          return [
            String(idx + 1),
            dateRecorded,
            r.assessmentType || "Offline Assessment",
            r.subject || "-",
            r.className || "-",
            r.category || "CA",
            String(r.gradedStudents || 0),
            `${r.averageScore.toFixed(1)} / ${r.maxMarks} (${pct}%)`,
            gradePill.label,
            r.status || "DRAFT",
          ];
        });

        await generatePDF({
          title: singleRecord
            ? `Offline Assessment Marksheet — ${singleRecord.assessmentType}`
            : "Offline Assessment Marksheets Directory",
          filename: `${sanitizedSchool}_offline_marksheets_${dateStr}.pdf`,
          schoolProfile,
          orientation: "landscape",
          metaData: [
            { label: "Class", value: className || singleRecord?.className || "All Classes" },
            { label: "Assessment Category", value: categoryLabel || singleRecord?.category || "Continuous Assessment" },
            { label: "Instructor / Evaluator", value: teacherName },
            { label: "Total Marksheets", value: `${finalRecordsToExport.length} assessments` },
            { label: "Date Range", value: dateRange === "ALL" ? "All Time" : dateRange.replace("_", " ") },
            { label: "Export Date", value: format(new Date(), "MMMM d, yyyy") },
          ],
          tableHeaders: [headers],
          tableData: rows,
          signatures: {
            left: {
              label: isTeacher ? "Class Teacher" : "Academic Evaluator",
              name: teacherName || "Assigned Instructor",
              subLabel: "Instructor Endorsement",
              signatureUrl: finalTeacherSig,
            },
            right: {
              label: digitalSignatures?.adminTitle || "Principal / Head of Institution",
              name: digitalSignatures?.adminName || schoolProfile?.principalName || "Head of Institution",
              signatureUrl: digitalSignatures?.principalSigUrl || schoolProfile?.primarySignature || schoolProfile?.signatureUrl,
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
          actorRole: isTeacher ? "TEACHER" : "ADMIN",
          resourceTitle: singleRecord
            ? `Offline Marksheet (${singleRecord.assessmentType} • ${singleRecord.subject})`
            : `Offline Assessment Marksheets Register (${className || "All Classes"})`,
          recordCount: finalRecordsToExport.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(
        `Offline marksheet records (${finalRecordsToExport.length}) exported successfully as ${selectedFormat.toUpperCase()}!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Offline grades export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export offline grades.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="size-5 text-emerald-600 dark:text-emerald-400" />
            {singleRecord ? "Export Marksheet Record" : "Export Offline Marksheets"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Generate leadership-endorsed offline continuous assessment registers with full audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
          />

          {/* Filters Grid: Status & Date Range */}
          {!singleRecord && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Filter className="size-3.5 text-slate-400" />
                  Marksheet Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">All Statuses ({records.length} total)</option>
                  <option value="PUBLISHED">Published Only</option>
                  <option value="DRAFT">Pending Draft Only</option>
                </select>
              </div>

              {/* Date Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  Date Duration / Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">All Time / Cumulative</option>
                  <option value="7_DAYS">Past 7 Days</option>
                  <option value="30_DAYS">Past 30 Days (Current Month)</option>
                  <option value="90_DAYS">Past 90 Days (Current Term)</option>
                  <option value="THIS_SESSION">This Academic Session (1 Year)</option>
                </select>
              </div>
            </div>
          )}

          {/* Record Limit Selector */}
          {!singleRecord && (
            <div className="space-y-1.5 bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Data Volume / Export Limit
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Selected: {finalRecordsToExport.length} of {filteredRecords.length} records
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {(["ALL", "10", "25", "50", "100", "CUSTOM"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRecordLimit(opt)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${recordLimit === opt
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                  >
                    {opt === "ALL" ? "All" : opt === "CUSTOM" ? "Custom" : opt}
                  </button>
                ))}
              </div>

              {recordLimit === "CUSTOM" && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Maximum marksheet records:</span>
                  <input
                    type="number"
                    min={1}
                    max={filteredRecords.length || 500}
                    value={customLimit}
                    onChange={(e) => setCustomLimit(parseInt(e.target.value, 10) || 1)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Export Format Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-center cursor-pointer ${selectedFormat === "pdf"
                  ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
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
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-center relative ${!isPaying
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
                className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-center relative ${!isPaying
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

          {/* Export preview summary */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Official Endorsements:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              {isTeacher ? "Class Teacher" : "Academic Evaluator"} &amp; Principal Signature Lines
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
            disabled={isExporting || (!isPaying && quota.remaining <= 0) || finalRecordsToExport.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="size-4" />
                <span>Generate Export ({finalRecordsToExport.length})</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

