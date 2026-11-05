"use client";

import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { FinanceTransaction } from "@/lib/api/services/financeService";

interface PaymentReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: FinanceTransaction | null;
}

export function PaymentReceiptModal({
  open,
  onOpenChange,
  receipt,
}: PaymentReceiptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-black text-slate-900 dark:text-white">
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        {receipt && (
          <div className="space-y-6 pt-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Reference</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {receipt.paymentReference || receipt.reference || receipt.id}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {format(new Date(receipt.createdAt), "PPP • HH:mm")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Payer / Student</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {receipt.student?.name || receipt.parent?.fullName || "General Payer"}
                </span>
              </div>
              {receipt.student?.studentCode && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Student Code</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {receipt.student.studentCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Fee Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {receipt.paymentType || "School Fee"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Payment Method</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {receipt.channel || "Direct Payment"}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Total Paid</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ₦{Number(receipt.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 rounded-xl h-11 font-bold text-xs gap-2"
              >
                <Printer size={14} />
                Print Receipt
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-11 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

