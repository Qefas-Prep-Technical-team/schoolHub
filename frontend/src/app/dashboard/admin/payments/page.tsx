"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import {
  financeService,
  FinanceAnalytics,
  FinanceTransaction,
} from "@/lib/api/services/financeService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  WalletCards,
  TrendingUp,
  CreditCard,
  Download,
  Plus,
  Receipt,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<FinanceTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadData = async (isManualRefresh = false) => {
    if (!schoolId) return;
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await financeService.getSchoolAnalytics(schoolId);
      setAnalytics(data);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const allTransactions = useMemo(() => {
    return analytics?.recentTransactions || [];
  }, [analytics]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const ref = t.paymentReference || t.reference || t.id;
      const matchSearch =
        searchQuery === "" ||
        t.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.parent?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUCCESS" && (t.status === "SUCCESS" || t.status === "completed" || t.status === "PAID")) ||
        (statusFilter === "PENDING" && (t.status === "PENDING" || t.status === "pending")) ||
        (statusFilter === "FAILED" && (t.status === "FAILED" || t.status === "failed"));

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

  // Totals
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

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.info("No payment transactions to export");
      return;
    }

    const headers = ["Reference", "Date", "Payer / Student", "Fee Category", "Method", "Amount (NGN)", "Status"];
    const rows = filteredTransactions.map((t) => [
      t.paymentReference || t.reference || t.id,
      format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
      t.student?.name || t.parent?.fullName || "General Payer",
      t.paymentType || "School Fee",
      t.channel || "Online Transfer",
      t.amount,
      t.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment_collections_${format(new Date(), "yyyyMMdd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReceipt = (transaction: FinanceTransaction) => {
    setSelectedReceipt(transaction);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-4 h-9 font-medium"
            onClick={() => router.back()}
          >
            <ChevronLeft size={18} className="mr-1" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Payments & Collections
            </h1>
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
              <WalletCards className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Collections</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
            Track student fee payments, incoming parent collections, and verified receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs gap-2"
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
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
          <Link href="/dashboard/admin/finance">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-5 rounded-xl font-bold text-xs gap-2">
              <Plus size={14} />
              Open Finance Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
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
            {allTransactions.length}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            Online payments & manual cash recordings
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
            {analytics?.accounts?.[0]?.bankName || "Direct Subaccount"}
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            {analytics?.accounts?.[0]?.accountNumber
              ? `Account: ****${analytics.accounts[0].accountNumber.slice(-4)}`
              : "Configured via Flutterwave/Paystack"}
          </p>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
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
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 w-[150px] text-xs font-bold">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="TUITION">Tuition Fee</SelectItem>
                <SelectItem value="EXAM">Exam Fee</SelectItem>
                <SelectItem value="UNIFORM">Uniforms</SelectItem>
                <SelectItem value="TRANSCRIPT">Transcripts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Date</TableHead>
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Reference</TableHead>
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student / Payer</TableHead>
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Fee Category</TableHead>
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Payment Method</TableHead>
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount</TableHead>
                <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                <TableHead className="text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <TableCell className="font-semibold text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {(t.paymentReference || t.reference || t.id).slice(0, 14)}...
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {t.student?.name || t.parent?.fullName || "General Payer"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold text-[10px]">
                        {t.paymentType || "School Fee"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {t.channel || "Bank Transfer"}
                    </TableCell>
                    <TableCell className="font-black text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      ₦{Number(t.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {t.status === "SUCCESS" || t.status === "completed" || t.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Success
                        </span>
                      ) : t.status === "PENDING" || t.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <Clock size={12} /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReceipt(t)}
                        className="h-8 rounded-lg text-xs font-bold gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Receipt size={14} />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    {loading ? "Loading transactions..." : "No payment collections recorded yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
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

      {/* Printable Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-black text-slate-900 dark:text-white">
              Payment Receipt
            </DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-6 pt-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Reference</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedReceipt.paymentReference || selectedReceipt.reference || selectedReceipt.id}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {format(new Date(selectedReceipt.createdAt), "PPP • HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Payer / Student</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedReceipt.student?.name || selectedReceipt.parent?.fullName || "General Payer"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Fee Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedReceipt.paymentType || "School Fee"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase">Payment Method</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedReceipt.channel || "Bank Transfer"}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Total Paid</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ₦{Number(selectedReceipt.amount).toLocaleString()}
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
                  onClick={() => setIsReceiptOpen(false)}
                  className="flex-1 rounded-xl h-11 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
