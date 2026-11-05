"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PaymentsTableSection } from "./PaymentsTableSection";
import { FinanceTransaction } from "@/lib/api/services/financeService";
import { DateGroup } from "@/utils/dateSectioning";

interface PaymentsFilterCardProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  dateGroups: DateGroup<FinanceTransaction>[];
  totalFiltered: number;
  loading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onOpenReceipt: (tx: FinanceTransaction) => void;
}

export function PaymentsFilterCard({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  dateGroups,
  totalFiltered,
  loading,
  page,
  pageSize,
  totalPages,
  setPage,
  onOpenReceipt,
}: PaymentsFilterCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search student, payer, or reference code..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
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

          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 w-[160px] text-xs font-bold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="TUITION">Tuition / Term Fee</SelectItem>
              <SelectItem value="TRANSCRIPT">Official Transcript</SelectItem>
              <SelectItem value="EXAM">Examination Fee</SelectItem>
              <SelectItem value="UNIFORM">School Uniform</SelectItem>
              <SelectItem value="OTHER">Other / Misc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date-Sectioned Table */}
      <PaymentsTableSection
        dateGroups={dateGroups}
        totalCount={totalFiltered}
        loading={loading}
        onOpenReceipt={onOpenReceipt}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalFiltered)} of {totalFiltered}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-8 px-3 rounded-lg text-xs font-bold"
            >
              <ChevronLeft size={14} className="mr-1" /> Prev
            </Button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="h-8 px-3 rounded-lg text-xs font-bold"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

