"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Loader2, Receipt } from "lucide-react";
import { FinanceTransaction } from "@/lib/api/services/financeService";
import { groupByDate } from "@/utils/dateSectioning";
import { PaymentsTableSection } from "@/app/dashboard/admin/payments/components/PaymentsTableSection";

interface FinanceTransactionsTabProps {
  transactions: FinanceTransaction[];
  transactionsLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  onPageChange: (page: number) => void;
  onOpenExportModal: () => void;
  onOpenReceipt: (tx: FinanceTransaction) => void;
}

export function FinanceTransactionsTab({
  transactions,
  transactionsLoading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  currentPage,
  totalPages,
  totalTransactions,
  onPageChange,
  onOpenExportModal,
  onOpenReceipt,
}: FinanceTransactionsTabProps) {
  const dateGroups = useMemo(() => {
    return groupByDate(transactions, (t) => t.createdAt);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search student name or reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 w-[140px] text-xs font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SUCCESS">Success / Cleared</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 w-[160px] text-xs font-bold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="TUITION">Tuition Fee</SelectItem>
              <SelectItem value="TRANSCRIPT">Transcript Clearance</SelectItem>
              <SelectItem value="EXAM_FEE">Exam Fee</SelectItem>
              <SelectItem value="UNIFORM">Uniforms</SelectItem>
              <SelectItem value="BUS_TRANSPORT">Transportation</SelectItem>
              <SelectItem value="PTA_LEVY">PTA Levy</SelectItem>
              <SelectItem value="OTHER">Other Fees</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={onOpenExportModal}
            className="h-11 rounded-2xl font-bold text-xs gap-1.5"
          >
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {transactionsLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-slate-400 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Filtering transactions...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center justify-center text-center space-y-3 px-4 shadow-sm">
          <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
            <Receipt size={32} />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Transactions Found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm">
            No transactions match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <PaymentsTableSection
            dateGroups={dateGroups}
            totalCount={transactions.length}
            loading={transactionsLoading}
            onOpenReceipt={onOpenReceipt}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <span className="text-xs text-slate-500 font-medium">
                Page {currentPage} of {totalPages} ({totalTransactions} records)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || transactionsLoading}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="h-9 px-3 rounded-xl text-xs font-bold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || transactionsLoading}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="h-9 px-3 rounded-xl text-xs font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
