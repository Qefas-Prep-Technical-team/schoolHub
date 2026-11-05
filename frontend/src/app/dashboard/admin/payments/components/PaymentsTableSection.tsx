"use client";

import React from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Receipt } from "lucide-react";
import { FinanceTransaction } from "@/lib/api/services/financeService";
import { DateGroup } from "@/utils/dateSectioning";

interface PaymentsTableSectionProps {
  dateGroups: DateGroup<FinanceTransaction>[];
  totalCount: number;
  loading: boolean;
  onOpenReceipt: (tx: FinanceTransaction) => void;
}

export function PaymentsTableSection({
  dateGroups,
  totalCount,
  loading,
  onOpenReceipt,
}: PaymentsTableSectionProps) {
  if (totalCount === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        {loading ? "Loading transactions..." : "No payment collections match your filter criteria."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateGroups.map((section) => (
        <div key={section.label} className="space-y-2.5">
          {/* Canonical Date Section Header */}
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="size-2 rounded-full bg-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {section.label}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
              {section.items.length} {section.items.length === 1 ? "record" : "records"}
            </span>
          </div>

          {/* Table Container for this Section */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40">
                <TableRow className="border-b border-slate-100 dark:border-slate-800">
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider pl-4">Time</TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Reference</TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student / Payer</TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Fee Classification</TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Method</TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount</TableHead>
                  <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-slate-400 uppercase text-[10px] font-black tracking-wider pr-4">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="font-semibold text-xs text-slate-500 whitespace-nowrap pl-4">
                      {format(new Date(t.createdAt), "h:mm a")}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {(t.paymentReference || t.reference || t.id).slice(0, 16)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {t.student?.name || t.parent?.fullName || "General Payer"}
                        </span>
                        {t.student?.studentCode && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {t.student.studentCode}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`font-black text-[10px] ${
                          (t.paymentType || "").toUpperCase().includes("TRANSCRIPT")
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        {t.paymentType || "School Fee"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {t.channel || "Online Transfer"}
                    </TableCell>
                    <TableCell className="font-black text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      ₦{Number(t.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {t.status === "SUCCESS" || t.status === "completed" || t.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Success
                        </span>
                      ) : t.status === "PENDING" || t.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <Clock size={12} /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenReceipt(t)}
                        className="h-8 rounded-lg text-xs font-bold gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Receipt size={14} />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}

