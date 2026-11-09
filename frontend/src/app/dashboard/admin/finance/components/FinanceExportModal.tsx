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
import { FinanceTransaction } from "@/lib/api/services/financeService";
import {
  exportFinanceTransactionsToExcel,
  exportFinanceTransactionsToCSV,
} from "../utils/financeSpreadsheetExporter";

export interface FinanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: FinanceTransaction[];
  schoolProfile?: any;
  schoolId?: string;
}

export function FinanceExportModal({
  isOpen,
  onClose,
  transactions,
  schoolProfile,
  schoolId,
}: FinanceExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
      (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const quotaContextId = schoolId || "admin_finance";
  const quota = getMonthlyExportUsage(quotaContextId);

  const filteredTxs = transactions.filter((t) => {
    if (statusFilter !== "ALL" && (t.status || "").toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (categoryFilter !== "ALL" && (t.paymentType || "").toUpperCase() !== categoryFilter.toUpperCase()) {
      return false;
    }
    return true;
  });

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Upgrade to Pro for unlimited financial exports.`
      );
      return;
    }

    if (!isPaying && selectedFormat !== "pdf") {
      toast.error("Excel (.xlsx) and CSV exports require a Pro institutional subscription.");
      return;
    }

    if (filteredTxs.length === 0) {
      toast.info("No financial transactions match your selected filters.");
      return;
    }

    setIsExporting(true);
    try {
      const schoolName = schoolProfile?.name || "School";
      const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
      const dateStr = format(new Date(), "yyyy-MM-dd");

      if (selectedFormat === "excel") {
        exportFinanceTransactionsToExcel(filteredTxs, schoolName);
      } else if (selectedFormat === "csv") {
        exportFinanceTransactionsToCSV(filteredTxs, schoolName, schoolProfile?.motto);
      } else {
        const headers = ["#", "Date", "Payer / Student", "Type", "Channel", "Amount (NGN)", "Status", "Reference"];
        const rows = filteredTxs.map((t, index) => [
          (index + 1).toString(),
          t.createdAt ? format(new Date(t.createdAt), "yyyy-MM-dd HH:mm") : "N/A",
          t.student?.name || t.parent?.fullName || "Institutional Payer",
          t.paymentType || "School Fee",
          t.channel || "Online Gateway",
          Number(t.amount || 0).toLocaleString(),
          t.status || "UNKNOWN",
          t.paymentReference || t.reference || t.id,
        ]);

        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        await generatePDF({
          title: "Official Institutional Financial Ledger",
          filename: `${sanitizedSchool}_finance_ledger_${dateStr}.pdf`,
          schoolProfile,
          metaData: [
            { label: "Date", value: format(new Date(), "MMMM d, yyyy") },
            { label: "Total Transactions", value: filteredTxs.length.toString() },
            { label: "Status Filter", value: statusFilter },
            { label: "Category Filter", value: categoryFilter },
            { label: "Security & Encryption", value: "256-Bit Ledger Verification" },
          ],
          tableHeaders: [headers],
          tableData: rows,
          signatures: digitalSignatures?.principalSigUrl
            ? {
                left: {
                  label: "Chief Financial Officer / Bursar",
                  name: "School Finance Office",
                  signatureUrl: undefined,
                  subLabel: "Financial Audit Board",
                },
                right: {
                  label: digitalSignatures.adminTitle || "Principal / Head of Institution",
                  name: digitalSignatures.adminName || "Head of Institution",
                  signatureUrl: digitalSignatures.principalSigUrl,
                  subLabel: "Official Ledger Endorsement",
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
          resourceTitle: "Official Financial Ledger Audit Export",
          recordCount: filteredTxs.length,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(
        `Financial ledger exported successfully as ${selectedFormat.toUpperCase()}!`
      );
      onClose();
    } catch (err: unknown) {
      console.error("Finance export error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to export financial records."
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
            Export Financial Ledger
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Generate verifiable institutional financial audits, fee collections, and transaction receipts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
          />

          {/* Filtering row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gateway Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success / Cleared</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fee Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Categories</option>
                <option value="TUITION">Tuition Fee</option>
                <option value="TRANSCRIPT">Transcript Clearance</option>
                <option value="EXAM_FEE">Exam Fee</option>
                <option value="UNIFORM">Uniforms</option>
                <option value="BUS_TRANSPORT">Transportation</option>
                <option value="PTA_LEVY">PTA Levy</option>
                <option value="OTHER">Other Fees</option>
              </select>
            </div>
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
                <span className="text-xs font-bold">PDF Ledger</span>
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
            <span>Transactions Included:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredTxs.length} of {transactions.length}
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
            disabled={isExporting || (!isPaying && quota.remaining <= 0) || filteredTxs.length === 0}
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
                <span>Generate Ledger</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

