"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, ShieldCheck } from "lucide-react";

export interface BillingTransaction {
  id: number | string;
  reference: string | null;
  createdAt?: string;
  amount: number;
  plan: string | null;
  status: string;
  paymentMethod?: string | null;
}

interface BillingStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: BillingTransaction[];
  schoolName: string;
  planName: string;
}

export function BillingStatementModal({
  open,
  onOpenChange,
  transactions,
  schoolName,
  planName,
}: BillingStatementModalProps) {
  const [statementRange, setStatementRange] = useState("ALL");

  const filteredForStatement = React.useMemo(() => {
    const now = new Date();
    if (statementRange === "30_DAYS") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return transactions.filter((t) => t.createdAt && new Date(t.createdAt) >= past30);
    }
    if (statementRange === "90_DAYS") {
      const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return transactions.filter((t) => t.createdAt && new Date(t.createdAt) >= past90);
    }
    if (statementRange === "THIS_YEAR") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return transactions.filter((t) => t.createdAt && new Date(t.createdAt) >= startOfYear);
    }
    return transactions;
  }, [transactions, statementRange]);

  const statementTotal = React.useMemo(() => {
    return filteredForStatement
      .filter((t) => t.status === "SUCCESS" || t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filteredForStatement]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-[2.5rem] p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Institutional Billing Statement
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Generated: {format(new Date(), "PPpp")}
                </span>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Statement of Account & Invoices
              </DialogTitle>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {schoolName} • Active Tier: {planName}
              </p>
            </div>

            <Select value={statementRange} onValueChange={setStatementRange}>
              <SelectTrigger className="h-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold w-[130px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Invoices</SelectItem>
                <SelectItem value="30_DAYS">Last 30 Days</SelectItem>
                <SelectItem value="90_DAYS">Last 90 Days</SelectItem>
                <SelectItem value="THIS_YEAR">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Period Range</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {statementRange === "30_DAYS"
                  ? "Last 30 Days"
                  : statementRange === "90_DAYS"
                    ? "Last 90 Days"
                    : statementRange === "THIS_YEAR"
                      ? "Calendar Year"
                      : "All Historical"}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Invoices</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {filteredForStatement.length} entries recorded
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Settled Amount</span>
              <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                ₦{statementTotal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[9px] font-black tracking-wider">
                  <th className="p-2.5 pl-3">Date</th>
                  <th className="p-2.5">Invoice / Ref</th>
                  <th className="p-2.5">Plan / Cycle</th>
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5 text-right">Amount (₦)</th>
                  <th className="p-2.5 text-right pr-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredForStatement.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-2.5 pl-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy") : "N/A"}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-500">
                      {t.reference || t.id}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                      {t.plan || planName}
                    </td>
                    <td className="p-2.5 text-slate-500">
                      {t.paymentMethod || "Direct Card / Gateway"}
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">
                      ₦{Number(t.amount).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right pr-3 font-black text-[10px]">
                      <span className={t.status === "SUCCESS" || t.status === "completed" ? "text-emerald-600" : "text-amber-600"}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-primary" />
              Verified Institutional Account Statement
            </span>
            <span>Page 1 of 1</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-5 font-bold text-xs">
            Close
          </Button>
          <Button
            onClick={() => window.print()}
            className="rounded-xl h-11 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2 shadow-lg cursor-pointer"
          >
            <Printer size={16} />
            Print Statement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

