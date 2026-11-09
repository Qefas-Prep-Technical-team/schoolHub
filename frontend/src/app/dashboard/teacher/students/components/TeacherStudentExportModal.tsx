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
  TeacherStudentExportItem,
  exportTeacherStudentsToExcel,
  exportTeacherStudentsToCSV,
} from "../utils/teacherStudentSpreadsheetExporter";

export interface TeacherStudentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: TeacherStudentExportItem[];
  classes?: Array<{ id: string; name: string }>;
  selectedClassId?: string;
  schoolProfile?: any;
  schoolId?: string;
  teacherName?: string;
}

export function TeacherStudentExportModal({
  isOpen,
  onClose,
  students,
  classes = [],
  selectedClassId = "",
  schoolProfile,
  schoolId,
  teacherName = "Faculty Teacher",
}: TeacherStudentExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [classFilter, setClassFilter] = useState<string>(selectedClassId || "ALL");
  const [dateRange, setDateRange] = useState<"ALL" | "7_DAYS" | "30_DAYS" | "90_DAYS" | "THIS_SESSION">("ALL");
  const [recordLimit, setRecordLimit] = useState<"ALL" | "10" | "25" | "50" | "100" | "CUSTOM">("ALL");
  const [customLimit, setCustomLimit] = useState<number>(25);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const effectiveSchoolId = schoolId || schoolProfile?.id || schoolProfile?.schoolId || "";
  const quotaContextId = effectiveSchoolId || "teacher_students";
  const quota = getMonthlyExportUsage(quotaContextId);

  const filteredList = useMemo(() => {
    return students.filter((s) => {
      if (classFilter !== "ALL") {
        const matchesClass =
          s.classId === classFilter ||
          (s.grade && classes.find((c) => c.id === classFilter)?.name.includes(s.grade));
        if (!matchesClass) return false;
      }

      if (dateRange !== "ALL") {
        const itemDate = (s as any).createdAt || (s as any).updatedAt;
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
  }, [students, classFilter, classes, dateRange]);

  const finalStudentsToExport = useMemo(() => {
    if (recordLimit === "ALL") return filteredList;
    const limitNum = recordLimit === "CUSTOM" ? Math.max(1, customLimit) : parseInt(recordLimit, 10);
    return filteredList.slice(0, limitNum);
  }, [filteredList, recordLimit, customLimit]);

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

    if (finalStudentsToExport.length === 0) {
      toast.info("No students match your filter criteria.");
      return;
    }

    setIsExporting(true);
    try {
      const schoolName = schoolProfile?.name || "School";
      const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
      const dateStr = format(new Date(), "yyyy-MM-dd");

      if (selectedFormat === "excel") {
        exportTeacherStudentsToExcel(finalStudentsToExport, schoolName);
      } else if (selectedFormat === "csv") {
        exportTeacherStudentsToCSV(finalStudentsToExport, schoolName, schoolProfile?.motto);
      } else {
        const headers = ["#", "Student Name", "Code", "Class", "Performance", "Attendance", "Last Exam"];
        const rows = finalStudentsToExport.map((s, index) => [
          (index + 1).toString(),
          s.name || "N/A",
          s.studentCode || "N/A",
          s.grade || "N/A",
          s.performance || "N/A",
          `${s.attendance ?? 0}%`,
          s.lastExam || "N/A",
        ]);

        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        await generatePDF({
          title: "Official Student Roster & Academic Directory",
          filename: `${sanitizedSchool}_students_${dateStr}.pdf`,
          schoolProfile,
          metaData: [
            { label: "Date Range", value: dateRange === "ALL" ? "All Time" : dateRange.replace("_", " ") },
            { label: "Total Students", value: finalStudentsToExport.length.toString() },
            {
              label: "Class Cohort",
              value: classFilter === "ALL" ? "All Assigned Classes" : classes.find((c) => c.id === classFilter)?.name || "Selected Class",
            },
            { label: "Faculty Member", value: teacherName },
            { label: "Export Date", value: format(new Date(), "MMMM d, yyyy") },
          ],
          tableHeaders: [headers],
          tableData: rows,
          signatures: {
            left: {
              label: "Class Teacher",
              name: teacherName || "Faculty Member",
              signatureUrl: undefined,
              subLabel: "Instructional Assessment",
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
          resourceTitle: "Student Roster & Directory Report",
          recordCount: finalStudentsToExport.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(
        `Students roster (${finalStudentsToExport.length} students) exported successfully as ${selectedFormat.toUpperCase()}!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Student export error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to export students roster."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="size-5 text-emerald-600 dark:text-emerald-400" />
            Export Student Directory
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Customize date scope, student limits, format, and generate official institution-endorsed rosters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
          />

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Class Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="size-3.5 text-slate-400" />
                Class Cohort
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Assigned Classes ({students.length} students)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range ("How long they want the export to be") */}
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
                <option value="THIS_SESSION">This Academic Session</option>
              </select>
            </div>
          </div>

          {/* Record Limit Selector */}
          <div className="space-y-1.5 bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Data Volume / Export Limit
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Selected: {finalStudentsToExport.length} of {filteredList.length} students
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
                <span className="text-xs font-semibold text-slate-500">Maximum students to export:</span>
                <input
                  type="number"
                  min={1}
                  max={filteredList.length || 500}
                  value={customLimit}
                  onChange={(e) => setCustomLimit(parseInt(e.target.value, 10) || 1)}
                  className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}
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

          {/* Endorsement Preview */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Official Endorsements:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Class Teacher &amp; {schoolProfile?.principalName ? "Principal" : "Head of Institution"} Signature Lines
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
            disabled={isExporting || (!isPaying && quota.remaining <= 0) || finalStudentsToExport.length === 0}
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
                <span>Generate Roster ({finalStudentsToExport.length})</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}