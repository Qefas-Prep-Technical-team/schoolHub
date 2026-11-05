"use client";

import React from "react";
import { useAdminPayments } from "./hooks/useAdminPayments";
import { PaymentsHeaderAndStats } from "./components/PaymentsHeaderAndStats";
import { PaymentsFilterCard } from "./components/PaymentsFilterCard";
import { PaymentReceiptModal } from "./components/PaymentReceiptModal";
import { StatementPrintModal } from "./components/StatementPrintModal";
import { Loader2, Landmark } from "lucide-react";

export default function AdminPaymentsPage() {
  const p = useAdminPayments();

  if (p.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Landmark className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
            Loading Payment Collections
          </p>
          <p className="text-slate-400 text-xs font-medium">
            Fetching institutional fee records and student clearance logs...
          </p>
        </div>
      </div>
    );
  }

  const bankAccountDisplay = p.analytics?.accounts?.[0]?.bankName
    ? `${p.analytics.accounts[0].bankName} (****${(p.analytics.accounts[0].accountNumber || "").slice(-4)})`
    : undefined;

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header and Summary KPIs */}
      <PaymentsHeaderAndStats
        schoolName={p.schoolName}
        totalCollections={p.totalCollections}
        successfulCount={p.successfulCount}
        totalCount={p.allTransactions.length}
        bankAccountInfo={bankAccountDisplay}
        refreshing={p.refreshing}
        onBack={() => p.router.back()}
        onRefresh={() => p.loadData(true)}
        onExportCSV={p.handleExportCSV}
        onOpenStatement={() => p.setIsStatementOpen(true)}
      />

      {/* Main Filter & Date-Sectioned Table Card */}
      <PaymentsFilterCard
        searchQuery={p.searchQuery}
        setSearchQuery={p.setSearchQuery}
        statusFilter={p.statusFilter}
        setStatusFilter={p.setStatusFilter}
        categoryFilter={p.categoryFilter}
        setCategoryFilter={p.setCategoryFilter}
        dateGroups={p.dateGroups}
        totalFiltered={p.filteredTransactions.length}
        loading={p.loading}
        page={p.page}
        pageSize={p.pageSize}
        totalPages={p.totalPages}
        setPage={p.setPage}
        onOpenReceipt={p.openReceipt}
      />

      {/* Printable Receipt Modal */}
      <PaymentReceiptModal
        open={p.isReceiptOpen}
        onOpenChange={p.setIsReceiptOpen}
        receipt={p.selectedReceipt}
      />

      {/* Official Bursary Statement Modal */}
      <StatementPrintModal
        open={p.isStatementOpen}
        onOpenChange={p.setIsStatementOpen}
        transactions={p.filteredTransactions}
        schoolName={p.schoolName}
      />
    </div>
  );
}
