"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import {
  financeService,
  FinanceAnalytics,
  FinanceTransaction,
} from "@/lib/api/services/financeService";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { groupByDate } from "@/utils/dateSectioning";

export function useAdminPayments() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<FinanceTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // School profile for verified name
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const schoolName =
    schoolProfile?.name ||
    user?.schools?.[0]?.name ||
    (user as unknown as { tenant?: { name?: string } })?.tenant?.name ||
    "Institutional Account";

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (!schoolId) {
        setLoading(false);
        return;
      }
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await financeService.getSchoolAnalytics(schoolId);
        setAnalytics(data);
      } catch (err: unknown) {
        console.error("Failed to load payment records", err);
        toast.error("Failed to load payment records");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [schoolId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Restrict to authorized admin roles
  useEffect(() => {
    if (!user) {
      router.replace("/login?redirect=/dashboard/admin/payments");
      return;
    }
    const role = String(
      (user as unknown as { adminRole?: string }).adminRole || user.role || ""
    );
    if (!["SCHOOL_OWNER", "ACCOUNTANT", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      toast.error("Access Restricted: Payment records are limited to authorized school administrators.");
      router.replace("/dashboard/admin");
    }
  }, [user, router]);

  const allTransactions = useMemo(() => {
    return analytics?.recentTransactions || [];
  }, [analytics]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const ref = t.paymentReference || t.reference || t.id;
      const matchSearch =
        searchQuery === "" ||
        t.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.student?.studentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.parent?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUCCESS" &&
          (t.status === "SUCCESS" || t.status === "completed" || t.status === "PAID")) ||
        (statusFilter === "PENDING" &&
          (t.status === "PENDING" || t.status === "pending")) ||
        (statusFilter === "FAILED" &&
          (t.status === "FAILED" || t.status === "failed"));

      const matchCat =
        categoryFilter === "ALL" ||
        Boolean(t.paymentType?.toUpperCase().includes(categoryFilter.toUpperCase()));

      return matchSearch && matchStatus && matchCat;
    });
  }, [allTransactions, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  // Date sectioning applied to paginated items
  const dateGroups = useMemo(() => {
    return groupByDate(paginatedTransactions, (t) => t.createdAt);
  }, [paginatedTransactions]);

  // Aggregated totals
  const totalCollections = useMemo(() => {
    return allTransactions
      .filter((t) => t.status === "SUCCESS" || t.status === "completed" || t.status === "PAID")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [allTransactions]);

  const successfulCount = useMemo(() => {
    return allTransactions.filter(
      (t) => t.status === "SUCCESS" || t.status === "completed" || t.status === "PAID"
    ).length;
  }, [allTransactions]);

  const handleExportCSV = useCallback(() => {
    if (filteredTransactions.length === 0) {
      toast.info("No payment transactions to export");
      return;
    }

    const headers = [
      "Execution Date",
      "Reference",
      "Student / Entity",
      "Student Code",
      "Classification",
      "Payment Channel",
      "Amount (NGN)",
      "Status",
    ];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
      `"${t.paymentReference || t.reference || t.id}"`,
      `"${t.student?.name || t.parent?.fullName || "General Payer"}"`,
      `"${t.student?.studentCode || "N/A"}"`,
      `"${t.paymentType || "School Fee"}"`,
      `"${t.channel || "Direct Payment"}"`,
      t.amount,
      `"${t.status}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment_collections_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payments ledger exported to CSV");
  }, [filteredTransactions]);

  const openReceipt = useCallback((transaction: FinanceTransaction) => {
    setSelectedReceipt(transaction);
    setIsReceiptOpen(true);
  }, []);

  return {
    user,
    router,
    schoolId,
    schoolName,
    loading,
    refreshing,
    analytics,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    pageSize,
    totalPages,
    allTransactions,
    filteredTransactions,
    paginatedTransactions,
    dateGroups,
    totalCollections,
    successfulCount,
    selectedReceipt,
    isReceiptOpen,
    setIsReceiptOpen,
    isStatementOpen,
    setIsStatementOpen,
    loadData,
    handleExportCSV,
    openReceipt,
  };
}
