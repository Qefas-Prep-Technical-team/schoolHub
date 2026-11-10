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
  type TermResultSpreadsheetData,
  exportTermResultToExcel,
  exportTermResultToCSV,
} from "../utils/termResultSpreadsheetExporter";

export interface StudentTermResultExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TermResultSpreadsheetData | null;
  schoolProfile?: any;
  schoolId?: string;
}

export function StudentTermResultExportModal({
  isOpen,
  onClose,
  data,
  schoolProfile,
  schoolId,
}: StudentTermResultExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "student_term_result_export";
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));

  React.useEffect(() => {
    if (isOpen) {
      setQuota(getMonthlyExportUsage(quotaContextId));
    }
  }, [isOpen, quotaContextId]);

  if (!isOpen || !data) return null;

  const schoolName = schoolProfile?.name || "School Portal";

  const handleDownload = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free tier download quota (${FREE_TIER_MONTHLY_EXPORT_LIMIT} exports) exceeded. Contact your administration to upgrade.`
      );
      return;
    }

    setIsExporting(true);

    try {
      if (selectedFormat === "excel") {
        if (!isPaying) {
          toast.error("Spreadsheet exports (.xlsx) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }
        exportTermResultToExcel(data, schoolName);
      } else if (selectedFormat === "csv") {
        if (!isPaying) {
          toast.error("CSV exports (.csv) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }
        exportTermResultToCSV(data, schoolName);
      } else {
        // PDF Export
        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        const tableHeaders = [
          ["#", "Course Code", "Subject Title", "Assignment", "Quiz/Test", "CA", "Exam", "Total Score", "Grade", "Status"],
        ];

        const tableData = data.records.map((r, idx) => [
          (idx + 1).toString(),
          r.courseCode || "—",
          r.subjectTitle,
          r.assignmentScore.toString(),
          r.quizScore.toString(),
          r.caScore.toString(),
          r.examScore.toString(),
          r.totalScore.toString(),
          r.grade,
          r.status,
        ]);

        const metaData = [
          { label: "Student Name", value: data.studentName },
          { label: "Student ID", value: data.studentCode },
          { label: "Class / Grade", value: data.className },
          { label: "Academic Session", value: data.sessionName },
          { label: "Academic Term", value: data.termName },
          { label: "Evaluated Subjects", value: `${data.revealedCount} of ${data.totalCount} released` },
          { label: "Term Average", value: data.averageScore != null ? `${data.averageScore.toFixed(1)}%` : "N/A" },
          { label: "Export Date", value: new Date().toLocaleDateString() },
        ];

        const safeStudent = data.studentName.replace(/\s+/g, "_");
        const safeTerm = data.termName.replace(/\s+/g, "_");

        await generatePDF({
          title: `${data.termName} Term Result Sheet (${data.sessionName})`,
          filename: `${safeStudent}_${safeTerm}_Result_Sheet.pdf`,
          schoolProfile,
          metaData,
          tableHeaders,
          tableData,
          signatures: isPaying
            ? {
              left: {
                label: "Class Teacher",
                name: "Assigned Instructor",
                subLabel: "Academic Evaluation",
              },
              right: {
                label: digitalSignatures?.adminTitle || "Principal / Director",
                name: digitalSignatures?.adminName || schoolProfile?.principalName || "Head of Institution",
                signatureUrl: digitalSignatures?.principalSigUrl,
                subLabel: "Institutional Endorsement",
              },
            }
            : {
              left: { label: "Class Teacher", name: "—", subLabel: "Unendorsed Record" },
              right: { label: "Principal / Director", name: "—", subLabel: "Unendorsed Record" },
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
      if (schoolId) {
        dispatchExportLeadershipNotification({
          schoolId,
          actorName: data.studentName,
          actorRole: "STUDENT",
          resourceTitle: `${data.termName} Term Result Sheet (${data.sessionName})`,
          recordCount: data.records.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification deferred:", err));
      }

      toast.success(
        `${selectedFormat.toUpperCase()} statement of results exported successfully!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Term result export failed:", err);
      toast.error("Failed to export result sheet. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            Export Term Result Sheet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {data.termName} ({data.sessionName}) • {data.studentName} ({data.className})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quota Banner */}
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={quota.limit}
            remaining={quota.remaining}
          />

          {/* Export Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Select Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {/* PDF Option */}
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${selectedFormat === "pdf"
                    ? "border-pink-600 bg-pink-50/50 dark:bg-pink-950/20 ring-1 ring-pink-600"
                    : "border-border hover:border-slate-300 dark:hover:border-zinc-700 bg-card"
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileText
                    className={`w-5 h-5 ${selectedFormat === "pdf" ? "text-pink-600" : "text-muted-foreground"
                      }`}
                  />
                  {selectedFormat === "pdf" && <CheckCircle2 className="w-4 h-4 text-pink-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Official PDF</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isPaying ? "Signed & Endorsed" : "Standard Format"}
                  </p>
                </div>
              </button>

              {/* Excel Option */}
              <button
                type="button"
                disabled={!isPaying}
                onClick={() => setSelectedFormat("excel")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${!isPaying
                    ? "opacity-50 cursor-not-allowed border-dashed bg-muted/30"
                    : selectedFormat === "excel"
                      ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                      : "border-border hover:border-slate-300 dark:hover:border-zinc-700 bg-card"
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileSpreadsheet
                    className={`w-5 h-5 ${selectedFormat === "excel" ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                  />
                  {selectedFormat === "excel" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Excel (.xlsx)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isPaying ? "Tabular Sheet" : "Pro Plan Only"}
                  </p>
                </div>
              </button>

              {/* CSV Option */}
              <button
                type="button"
                disabled={!isPaying}
                onClick={() => setSelectedFormat("csv")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${!isPaying
                    ? "opacity-50 cursor-not-allowed border-dashed bg-muted/30"
                    : selectedFormat === "csv"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-600"
                      : "border-border hover:border-slate-300 dark:hover:border-zinc-700 bg-card"
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileSpreadsheet
                    className={`w-5 h-5 ${selectedFormat === "csv" ? "text-blue-600" : "text-muted-foreground"
                      }`}
                  />
                  {selectedFormat === "csv" && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">CSV (.csv)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isPaying ? "Raw Data" : "Pro Plan Only"}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Result Sheet Metrics Summary Card */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Student Name</span>
              <span className="font-bold text-foreground">{data.studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Class Cohort</span>
              <span className="font-bold text-foreground">{data.className}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Academic Session & Term</span>
              <span className="font-bold text-foreground">
                {data.sessionName} • {data.termName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Released Subjects</span>
              <span className="font-bold text-foreground">
                {data.revealedCount} of {data.totalCount} Subjects
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Term Average</span>
              <span className="font-bold text-foreground">
                {data.averageScore != null ? `${data.averageScore.toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            disabled={isExporting}
            onClick={onClose}
            className="sm:w-auto w-full text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isExporting || (!isPaying && quota.remaining <= 0)}
            onClick={handleDownload}
            className="sm:w-auto w-full text-xs font-semibold gap-1.5 bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Exporting {selectedFormat.toUpperCase()}...
              </>
            ) : !isPaying && quota.remaining <= 0 ? (
              "Monthly Quota Exceeded (10/10)"
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export {selectedFormat.toUpperCase()} Sheet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
