"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  WalletCards,
  TrendingUp,
  CreditCard,
  Download,
  Plus,
  RefreshCw,
  Printer,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaymentsHeaderAndStatsProps {
  schoolName: string;
  totalCollections: number;
  successfulCount: number;
  totalCount: number;
  bankAccountInfo?: string;
  refreshing: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onOpenStatement: () => void;
}

export function PaymentsHeaderAndStats({
  schoolName,
  totalCollections,
  successfulCount,
  totalCount,
  bankAccountInfo,
  refreshing,
  onBack,
  onRefresh,
  onExportCSV,
  onOpenStatement,
}: PaymentsHeaderAndStatsProps) {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-4 h-9 font-medium"
            onClick={onBack}
          >
            <ChevronLeft size={18} className="mr-1" /> Back to Overview
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Payments & Collections
            </h1>
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
              <WalletCards className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Collections</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
            Track student fee payments, incoming parent collections, and certified bursary receipts for {schoolName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs gap-2"
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={onExportCSV}
            className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs gap-2"
          >
            <Download size={14} />
            Export CSV
          </Button>
          <Button
            onClick={onOpenStatement}
            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 h-11 px-4 rounded-xl font-bold text-xs gap-2"
          >
            <Printer size={14} />
            Print Statement
          </Button>
          <Link href="/dashboard/admin/finance">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-5 rounded-xl font-bold text-xs gap-2 cursor-pointer shadow-md shadow-blue-600/20">
              <Plus size={14} />
              Finance Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Cleared
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Collections
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            ₦{totalCollections.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            {successfulCount} verified incoming transactions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <WalletCards size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-600 border-blue-500/20">
              Ledger
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Transactions
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {totalCount}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            Online gateway & manual bursary records
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CreditCard size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-600 border-purple-500/20">
              Settlement
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Connected Bank Account
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">
            {bankAccountInfo || "Direct Subaccount"}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            Configured via Flutterwave/Paystack direct conduit
          </p>
        </div>
      </div>
    </div>
  );
}

