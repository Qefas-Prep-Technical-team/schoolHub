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
import { ExportQuotaBanner } from "@/app/dashboard/admin/grades/components/export/ExportQuotaBanner";
import {
  StudentTranscriptSpreadsheetData,
  exportOfficialTranscriptToExcel,
  exportOfficialTranscriptToCSV,
} from "../utils/transcriptSpreadsheetExporter";

export interface StudentOfficialTranscriptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StudentTranscriptSpreadsheetData | null;
  schoolProfile?: any;
  schoolId?: string;
  onExportPdf: () => Promise<void>;
  isExportingPdf: boolean;
}

export function StudentOfficialTranscriptExportModal({
  isOpen,
  onClose,
  data,
  schoolProfile,
  schoolId,
  onExportPdf,
  isExportingPdf,
}: StudentOfficialTranscriptExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExportingSpreadsheet, setIsExportingSpreadsheet] = useState(false);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
      (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "student_transcript_export";
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));

  React.useEffect(() => {
    if (isOpen) {
      setQuota(getMonthlyExportUsage(quotaContextId));
    }
  }, [isOpen, quotaContextId]);

  if (!isOpen || !data) return null;

  const isExporting = isExportingPdf || isExportingSpreadsheet;

  const handleDownload = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free tier download quota (${FREE_TIER_MONTHLY_EXPORT_LIMIT} exports) exceeded. Contact your administration to upgrade.`
      );
      return;
    }

    try {
      if (selectedFormat === "excel") {
        if (!isPaying) {
          toast.error("Spreadsheet exports (.xlsx) are only available on institutional paid plans.");
          return;
        }
        setIsExportingSpreadsheet(true);
        exportOfficialTranscriptToExcel(data);
      } else if (selectedFormat === "csv") {
        if (!isPaying) {
          toast.error("CSV exports (.csv) are only available on institutional paid plans.");
          return;
        }
        setIsExportingSpreadsheet(true);
        exportOfficialTranscriptToCSV(data);
      } else {
        await onExportPdf();
      }

      // Decrement quota for free tier
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
          resourceTitle: `Official Academic Transcript (${data.selectedSessionName})`,
          recordCount: data.filteredResults.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification deferred:", err));
      }

      if (selectedFormat !== "pdf") {
        toast.success(
          `${selectedFormat.toUpperCase()} transcript record exported successfully!`
        );
      }
      onClose();
    } catch (err: unknown) {
      console.error("Transcript export failed:", err);
      toast.error("Failed to export transcript. Please try again.");
    } finally {
      setIsExportingSpreadsheet(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isExporting && !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            Export Academic Transcript
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {data.studentName} ({data.studentCode}) • {data.departmentOrClass}
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
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedFormat === "pdf"
                    ? "border-pink-600 bg-pink-50/50 dark:bg-pink-950/20 ring-1 ring-pink-600"
                    : "border-border hover:border-slate-300 dark:hover:border-zinc-700 bg-card"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileText
                    className={`w-5 h-5 ${
                      selectedFormat === "pdf" ? "text-pink-600" : "text-muted-foreground"
                    }`}
                  />
                  {selectedFormat === "pdf" && <CheckCircle2 className="w-4 h-4 text-pink-600" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Official PDF</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isPaying ? "Signed & Endorsed" : "Standard Multi-Page"}
                  </p>
                </div>
              </button>

              {/* Excel Option */}
              <button
                type="button"
                disabled={!isPaying}
                onClick={() => setSelectedFormat("excel")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  !isPaying
                    ? "opacity-50 cursor-not-allowed border-dashed bg-muted/30"
                    : selectedFormat === "excel"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                    : "border-border hover:border-slate-300 dark:hover:border-zinc-700 bg-card"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileSpreadsheet
                    className={`w-5 h-5 ${
                      selectedFormat === "excel" ? "text-emerald-600" : "text-muted-foreground"
                    }`}
                  />
                  {selectedFormat === "excel" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Excel (.xlsx)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isPaying ? "Tabular Transcript" : "Pro Plan Only"}
                  </p>
                </div>
              </button>

              {/* CSV Option */}
              <button
                type="button"
                disabled={!isPaying}
                onClick={() => setSelectedFormat("csv")}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  !isPaying
                    ? "opacity-50 cursor-not-allowed border-dashed bg-muted/30"
                    : selectedFormat === "csv"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-600"
                    : "border-border hover:border-slate-300 dark:hover:border-zinc-700 bg-card"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <FileSpreadsheet
                    className={`w-5 h-5 ${
                      selectedFormat === "csv" ? "text-blue-600" : "text-muted-foreground"
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

          {/* Transcript Document Summary Card */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Scholar / Student</span>
              <span className="font-bold text-foreground">{data.studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Academic Scope</span>
              <span className="font-bold text-foreground">
                {data.selectedSessionName} • {data.selectedTermLabel}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Cumulative CGPA</span>
              <span className="font-bold text-foreground">
                {data.stats.cgpa} ({data.stats.cgpaGrade})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Academic Standing</span>
              <span className="font-bold text-foreground">{data.stats.academicStanding}</span>
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
                Export {selectedFormat.toUpperCase()} Transcript
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

