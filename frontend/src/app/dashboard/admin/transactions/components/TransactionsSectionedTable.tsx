"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CreditCard, ChevronLeft, ChevronRight, Search, Copy, Receipt, ArrowRight, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import SuccessLottie from "@/lotties/Success.json";
import CancelLottie from "@/lotties/Cancel.json";
import ProcessingLottie from "@/lotties/Processing.json";
import { toast } from "react-toastify";
import { DateGroup } from "@/utils/dateSectioning";

export interface TransactionItem {
  id: number | string;
  reference: string | null;
  date?: string;
  createdAt?: string;
  amount: number;
  plan: string | null;
  status: string;
  billingCycle?: string | null;
  paymentMethod?: string | null;
  expiryDate?: string;
}

interface TransactionsSectionedTableProps {
  dateGroups: DateGroup<TransactionItem>[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getTxnStatusCategory = (status?: string | null): "SUCCESS" | "PENDING" | "FAILED" => {
  const normalized = (status || "").trim().toUpperCase();
  if (normalized === "SUCCESS" || normalized === "COMPLETED" || normalized === "PAID") {
    return "SUCCESS";
  }
  if (normalized === "PENDING" || normalized === "INITIATED" || normalized === "PROCESSING") {
    return "PENDING";
  }
  return "FAILED";
};

export function TransactionsSectionedTable({
  dateGroups,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
}: TransactionsSectionedTableProps) {
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const selectedStatusCategory = selectedTxn ? getTxnStatusCategory(selectedTxn.status) : null;

  const activeLottieData = useMemo(() => {
    if (!selectedTxn || !selectedStatusCategory) return null;
    const source =
      selectedStatusCategory === "SUCCESS"
        ? SuccessLottie
        : selectedStatusCategory === "PENDING"
          ? ProcessingLottie
          : CancelLottie;
    return JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
  }, [selectedTxn, selectedStatusCategory]);

  if (totalCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
          <Search size={32} />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
          No Transactions Found
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          No institutional billing or ledger records match your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateGroups.map((section) => (
        <div key={section.label} className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="size-2 rounded-full bg-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {section.label}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
              {section.items.length} {section.items.length === 1 ? "record" : "records"}
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/60 dark:bg-slate-800/40">
                <TableRow className="border-b border-slate-100 dark:border-slate-800">
                  <TableHead className="pl-6 py-4 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    Invoice / Ref
                  </TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    Plan / Tier
                  </TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider text-center">
                    Time
                  </TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider text-center">
                    Amount
                  </TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    Method
                  </TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider text-center">
                    Status
                  </TableHead>
                  <TableHead className="pr-6 text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTxn(txn)}
                  >
                    <TableCell className="pl-6 py-4 font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {txn.reference || `INV-${txn.id}`}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {txn.plan || "Institutional License"}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500 text-center">
                      {txn.createdAt || txn.date ? format(new Date(txn.createdAt || txn.date || ""), "h:mm a") : "—"}
                    </TableCell>
                    <TableCell className="font-black text-sm text-slate-900 dark:text-white text-center">
                      {txn.amount === 0 ? "Free" : `₦${Number(txn.amount).toLocaleString()}`}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {txn.paymentMethod?.replace("_", " ") || "Card / Gateway"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${txn.status?.toUpperCase() === "SUCCESS" || txn.status?.toLowerCase() === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : txn.status?.toUpperCase() === "PENDING"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                      >
                        {txn.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxn(txn);
                        }}
                        className="h-8 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Receipt size={14} /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {section.items.map((txn, idx) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelectedTxn(txn)}
                className="p-4 flex flex-col gap-2.5 active:bg-slate-50 dark:active:bg-slate-800/40 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {txn.reference || `INV-${txn.id}`}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getTxnStatusCategory(txn.status) === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : getTxnStatusCategory(txn.status) === "PENDING"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                  >
                    {txn.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₦{Number(txn.amount).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {txn.plan || "Institutional Plan"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">
                    {txn.createdAt || txn.date ? format(new Date(txn.createdAt || txn.date || ""), "h:mm a") : "—"}
                  </span>
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    Receipt <ArrowRight size={12} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-medium">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-9 px-3 rounded-xl text-xs font-bold"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-9 px-3 rounded-xl text-xs font-bold"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none w-full max-w-md max-h-[92vh] overflow-y-auto" showCloseButton={false}>
          {selectedTxn && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
              <button
                onClick={() => setSelectedTxn(null)}
                className="absolute top-4 right-4 h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 text-sm"
              >
                &times;
              </button>

              <div className="flex flex-col items-center text-center pt-4 pb-2">
                {activeLottieData && selectedStatusCategory && (
                  <div className="w-[110px] h-[110px] flex items-center justify-center mx-auto mb-2 shrink-0">
                    <Lottie
                      key={`${selectedTxn.id}-${selectedStatusCategory}`}
                      animationData={activeLottieData}
                      loop={selectedStatusCategory === "PENDING"}
                      autoplay={true}
                      rendererSettings={{
                        preserveAspectRatio: "xMidYMid meet",
                        progressiveLoad: false,
                      }}
                      className="w-full h-full"
                      style={{ height: "110px", width: "110px" }}
                    />
                  </div>
                )}
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedStatusCategory === "SUCCESS"
                    ? "Payment Receipt"
                    : selectedStatusCategory === "PENDING"
                      ? "Payment Pending"
                      : "Payment Failed"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStatusCategory === "SUCCESS"
                    ? "Institutional Billing Transaction"
                    : selectedStatusCategory === "PENDING"
                      ? "Transaction awaiting confirmation"
                      : "Transaction unsuccessful or cancelled"}
                </p>
              </div>

              <div className="space-y-3 py-4 border-t border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                    <span>{selectedTxn.reference || selectedTxn.id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(String(selectedTxn.reference || selectedTxn.id));
                        toast.success("Copied reference!");
                      }}
                    >
                      <Copy size={12} className="text-slate-400 hover:text-blue-600" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    ₦{Number(selectedTxn.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan / Item:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedTxn.plan || "Institutional License"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold uppercase text-emerald-600">
                    {selectedTxn.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {selectedTxn.createdAt || selectedTxn.date ? format(new Date(selectedTxn.createdAt || selectedTxn.date || ""), "MMM d, yyyy • h:mm a") : "—"}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => setSelectedTxn(null)}
                  className="h-10 px-6 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

