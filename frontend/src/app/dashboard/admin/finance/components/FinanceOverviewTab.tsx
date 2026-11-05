"use client"

import React from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Wallet, ArrowRight, CheckCircle2, Clock, XCircle, Receipt } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { FinanceAnalytics, FinanceTransaction, FinanceSettlementAccount } from "@/lib/api/services/financeService"
import { PaymentStatusCard } from "../../components/PaymentStatusCard"
import { AtmAccountCard } from "../../components/AtmAccountCard"

interface FinanceOverviewTabProps {
    schoolId: string; analytics: FinanceAnalytics | null; accounts: FinanceSettlementAccount[]
    onSync: (accountId?: string) => void; onManageBanks: () => void
    onViewAllTransactions: () => void; onOpenReceipt: (tx: FinanceTransaction) => void
}

export function FinanceOverviewTab({
    schoolId, analytics, accounts, onSync, onManageBanks, onViewAllTransactions, onOpenReceipt,
}: FinanceOverviewTabProps) {
    const monthlyTrends = analytics?.monthlyTrends || []
    const categoryBreakdown = analytics?.categoryBreakdown || []
    const recentTransactions = analytics?.recentTransactions || []

    return (
        <div className="space-y-8">
            {analytics?.paymentStatus && (
                <PaymentStatusCard status={analytics.paymentStatus} schoolId={schoolId} onRefresh={() => onSync()} />
            )}

            {/* Liquidity Chart & Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Income Trend</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Monthly fee collections (Last 6 Months)
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-600" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Revenue (₦)</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        {monthlyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="financeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                                        tickFormatter={(v) => `₦${(Number(v) / 1000).toFixed(0)}k`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            borderRadius: "1rem",
                                            border: "none",
                                            color: "#fff",
                                            fontSize: "12px",
                                            padding: "10px 14px",
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                                        }}
                                        formatter={(value) => [`₦${Number(value).toLocaleString()}`, "Revenue"]}
                                        labelStyle={{ fontWeight: 800, color: "#94a3b8", marginBottom: "4px" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#financeRevenueGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                                <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Payment Trends Yet</p>
                                <p className="text-xs text-slate-400 max-w-xs">
                                    Chart updates automatically as school fee payments are received.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fee Categories</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Income breakdown by fee type
                        </p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {categoryBreakdown.length > 0 ? (
                            categoryBreakdown.map((cat, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 dark:text-white font-black">
                                                ₦{cat.amount.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold">
                                                ({cat.percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                    <Progress value={cat.percentage} className="h-2 rounded-full" />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 text-slate-400">
                                <Wallet size={32} />
                                <p className="text-xs font-semibold">
                                    All categories default to Tuition & General Fees
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Active Channels</span>
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] font-bold">Card</Badge>
                            <Badge variant="outline" className="text-[10px] font-bold">Transfer</Badge>
                            <Badge variant="outline" className="text-[10px] font-bold">Cash</Badge>
                            <Badge variant="outline" className="text-[10px] font-bold">POS</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settlement Accounts Row */}
            {accounts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bank Accounts for Payouts</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Verified bank accounts receiving automated online fee deposits
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onManageBanks}
                            className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                        >
                            <span>Manage Bank Accounts</span>
                            <ArrowRight size={14} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map((acc) => (
                            <AtmAccountCard
                                key={acc.id}
                                account={{
                                    ...acc,
                                    status: acc.status as "active" | "pending" | "unverified",
                                }}
                                onRefresh={(id) => onSync(id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Stream Preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Latest fee payments recorded online and manually
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onViewAllTransactions}
                        className="rounded-xl font-bold text-xs gap-1.5"
                    >
                        <span>View All Transactions</span>
                        <ArrowRight size={14} />
                    </Button>
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Date</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student / Payer</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Fee Type</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Payment Method</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                                    <TableHead className="text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.slice(0, 5).map((t) => (
                                    <TableRow key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <TableCell className="font-semibold text-xs text-slate-500">
                                            {format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}
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
                                            {t.channel || "Online Gateway"}
                                        </TableCell>
                                        <TableCell className="font-black text-sm text-slate-900 dark:text-white">
                                            ₦{t.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {t.status === "SUCCESS" || t.status === "COMPLETED" ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 size={12} /> Success
                                                </span>
                                            ) : t.status === "PENDING" ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    <Clock size={12} /> Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 dark:text-red-400">
                                                    <XCircle size={12} /> Failed
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
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
                ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                        No transactions recorded yet. Record your first payment above.
                    </div>
                )}
            </div>
        </div>
    )
}
