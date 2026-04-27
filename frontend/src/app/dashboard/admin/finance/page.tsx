"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService } from "@/lib/api/services/financeService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Landmark, ArrowUpRight, TrendingUp, Users, Wallet, Loader2, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { table } from "console"
import { toast } from "react-toastify"
import { PaymentStatusCard } from "../components/PaymentStatusCard"
import { AtmAccountCard } from "../components/AtmAccountCard"
import { cn } from "@/lib/utils"
import { ShieldCheck, Plus } from "lucide-react"

/**
 * Admin Finance Overview Page
 */
export default function AdminFinancePage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId
    
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (schoolId) {
            financeService.getSchoolAnalytics(schoolId)
                .then(setAnalytics)
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [schoolId])
    
    const handleSync = async (accountId?: string) => {
        if (!schoolId) return
        try {
            setLoading(true)
            const result = await financeService.syncSubaccountStatus(schoolId, accountId)
            toast.success(result.message)
            const updated = await financeService.getSchoolAnalytics(schoolId)
            setAnalytics(updated)
        } catch (error: any) {
            toast.error(error.message || "Sync failed")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-muted-foreground font-medium">Fetching financial analytics...</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Finance Hub</h1>
                        {analytics?.isVerified && (
                            <div className="flex items-center gap-1.5 bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full border border-blue-500/20 mt-1">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Verified Gateway</span>
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Monitor fee collections, settlements, and financial health.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-xl border-2 font-bold h-12"
                        onClick={() => router.push("/dashboard/admin/finance/transactions")}
                    >
                        View All Internal Logs
                    </Button>
                    <Button 
                        variant="outline"
                        className="rounded-xl border-2 font-bold h-12 bg-white hover:bg-slate-50"
                        onClick={() => {
                            if (!analytics?.recentTransactions) return;
                            const headers = ["Date", "Student", "Category", "Amount", "Reference"]
                            const rows = analytics.recentTransactions.map((t: any) => [
                                format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
                                t.student?.name,
                                t.paymentType || "School Fee",
                                t.amount,
                                t.paymentReference
                            ])
                            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
                            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement("a")
                            link.setAttribute("href", url)
                            link.setAttribute("download", `finance_report_${format(new Date(), "yyyyMMdd")}.csv`)
                            link.click()
                        }}
                    >
                        <Download className="mr-2 h-5 w-5" />
                        Download Report
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-12 font-bold shadow-lg shadow-blue-500/20"
                        onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                    >
                        <Landmark className="mr-2 h-5 w-5" />
                        Settlement Bank Setup
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Revenue", value: analytics?.totalRevenue || 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
                    { title: "Pending Payments", value: analytics?.pendingRevenue || 0, icon: Wallet, color: "text-amber-500", bg: "bg-amber-50" },
                    { title: "Paying Students", value: analytics?.activePayerCount || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { title: "Avg. Transaction", value: analytics?.averageTransaction || 0, icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                            <div className={`${stat.bg} p-2 rounded-xl`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {stat.title.includes("Students") ? stat.value : `₦${stat.value.toLocaleString()}`}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Real-time valuation</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payment Account Status Overview */}
            {analytics?.paymentStatus && (
                <div className="mb-4">
                    <PaymentStatusCard 
                        status={analytics.paymentStatus} 
                        schoolId={schoolId}
                        onRefresh={handleSync}
                    />
                </div>
            )}

            {/* Settlement Accounts Vault */}
            {analytics?.accounts && analytics.accounts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Settlement Vault</h2>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">Active conduits for fee disbursements.</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 gap-2"
                            onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                        >
                            <Plus className="h-3 w-3" />
                            Add Account
                        </Button>
                    </div>
                    <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
                        {analytics.accounts.map((acc: any) => (
                            <div key={acc.id} className="snap-center flex-shrink-0 w-full sm:w-auto">
                                <AtmAccountCard 
                                    account={acc} 
                                    onRefresh={(id) => handleSync(id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900/50">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black">Recent Fee Transactions</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1">Snapshot of the latest successful payments processed.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {!analytics?.recentTransactions || analytics.recentTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <Wallet className="h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No Transactions Yet</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mt-2">Connect your bank account to start receiving fee payments from parents.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <TableRow>
                                        <TableHead className="pl-8 py-5">Timestamp</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="pr-8">Reference ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.recentTransactions.map((t: any) => (
                                        <TableRow key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 border-b border-slate-50 dark:border-slate-800 transition-colors">
                                            <TableCell className="pl-8 py-5 font-medium text-slate-500">
                                                {format(new Date(t.createdAt), "MMM dd, HH:mm")}
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-900 dark:text-white">{t.student?.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-black text-[10px] py-1">
                                                    {t.paymentType || "School Fee"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-black text-slate-900 dark:text-white">₦{t.amount.toLocaleString()}</TableCell>
                                            <TableCell className="pr-8 font-mono text-[10px] text-slate-400 uppercase tracking-widest">{t.paymentReference}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
