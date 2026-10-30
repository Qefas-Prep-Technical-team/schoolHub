"use client";

import React, { useState, useMemo } from "react";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import { useSchoolBilling } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import AdminTransactionsLoading from "./loading";
import {
  ChevronLeft,
  History,
  TrendingUp,
  CreditCard,
  Wallet,
  Download,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";

export default function AdminTransactionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: billingData, isLoading, refetch, isRefetching } = useSchoolBilling(
    schoolId as string,
    {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }
  );

  const rawTransactions = useMemo(() => {
    return billingData?.transactions || [];
  }, [billingData]);

  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter((txn) => {
      const ref = txn.reference || String(txn.id || "");
      const plan = txn.plan || "";
      const matchesSearch =
        searchQuery === "" ||
        ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        txn.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawTransactions, searchQuery, statusFilter]);

  // Aggregate stats
  const totalVolume = useMemo(() => {
    return rawTransactions
      .filter((t) => t.status === "SUCCESS" || t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [rawTransactions]);

  const successCount = useMemo(() => {
    return rawTransactions.filter(
      (t) => t.status === "SUCCESS" || t.status === "completed"
    ).length;
  }, [rawTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No transaction records to export");
      return;
    }

    const headers = ["Invoice / Reference", "Date", "Plan", "Amount", "Method", "Status"];
    const rows = filteredTransactions.map((t) => [
      t.reference || t.id,
      t.createdAt ? format(new Date(t.createdAt), "yyyy-MM-dd HH:mm") : "N/A",
      t.plan || "N/A",
      t.amount,
      t.paymentMethod || "Direct Card / Gateway",
      t.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_audit_${format(new Date(), "yyyyMMdd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <AdminTransactionsLoading />;
  }

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-4 h-9 font-medium"
            onClick={() => router.back()}
          >
            <ChevronLeft size={18} className="mr-1" /> Return
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Transaction History
              </h1>
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                <History className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Audit Log</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
              Comprehensive ledger of institutional billing settlements, plan upgrades, and payment transitions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs gap-2"
          >
            <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs gap-2"
          >
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Settled
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Settled Volume
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            ₦{totalVolume.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            {successCount} verified payments
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-600 border-blue-500/20">
              Ledger
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Invoices Recorded
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {billingData?.totalTransactions ?? rawTransactions.length}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            Institutional license and subscription cycles
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CreditCard size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 border-purple-500/20">
              Active Plan
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Subscription Tier
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">
            {billingData?.subscription?.plan || user?.plan || "Institutional Plan"}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            {billingData?.subscription?.billingCycle
              ? `Billed ${billingData.subscription.billingCycle}`
              : "Standard Billing"}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by invoice or plan name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 w-[140px] text-xs font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SUCCESS">Success / Cleared</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ledger Table */}
      <TransactionHistory
        items={filteredTransactions}
        totalItems={filteredTransactions.length}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
