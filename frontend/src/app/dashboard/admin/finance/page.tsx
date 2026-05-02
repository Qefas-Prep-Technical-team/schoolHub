"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService } from "@/lib/api/services/financeService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Landmark, ArrowUpRight, TrendingUp, Users, Wallet, Loader2, Download, ChevronLeft, ShieldCheck, Plus, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from "react-toastify"
import { PaymentStatusCard } from "../components/PaymentStatusCard"
import { AtmAccountCard } from "../components/AtmAccountCard"
import { cn } from "@/lib/utils"

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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Encrypting Financial Data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Button 
                        variant="ghost" 
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-4"
                        onClick={() => router.push("/dashboard/admin")}
                    >
                        <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Finance Hub
                            </h1>
                            {analytics?.isVerified && (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 mt-1">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Verified Gateway</span>
                                </div>
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                            Real-time institutional liquidity analytics & fee monitoring
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button 
                        variant="outline" 
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-14 px-6 rounded-2xl font-bold shadow-sm"
                        onClick={() => router.push("/dashboard/admin/finance/transactions")}
                    >
                        <Receipt size={18} className="mr-2" /> 
                        Internal Logs
                    </Button>
                    <Button 
                        className="bg-primary hover:bg-primary text-white h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2"
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
                        <Download size={18} />
                        Financial Report
                    </Button>
                    <Button 
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 h-14 px-8 rounded-2xl font-bold shadow-xl gap-2"
                        onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                    >
                        <Landmark size={18} />
                        Settlement Node
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Revenue", value: analytics?.totalRevenue || 0, icon: TrendingUp, color: "text-primary dark:text-primary", bg: "bg-primary/10", trend: "+14.2%" },
                    { title: "Pending Payments", value: analytics?.pendingRevenue || 0, icon: Wallet, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", trend: "Review" },
                    { title: "Active Payers", value: analytics?.activePayerCount || 0, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", trend: "Live" },
                    { title: "Avg. Transaction", value: analytics?.averageTransaction || 0, icon: ArrowUpRight, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", trend: "Optimized" },
                ].map((stat, i) => (
                    <div 
                        key={i}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-1"
                    >
                        {/* Background Decorative Icon */}
                        <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none">
                            <stat.icon size={120} />
                        </div>

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", stat.bg, stat.color)}>
                                <stat.icon size={28} />
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.title}</p>
                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg", stat.bg, stat.color)}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                                    {stat.title.includes("Payers") ? stat.value : `₦${stat.value.toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                    </div>
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

            {/* Payment Account Status Overview */}
            {analytics?.paymentStatus && (
                <div className="mx-1">
                    <PaymentStatusCard 
                        status={analytics.paymentStatus} 
                        schoolId={schoolId}
                        onRefresh={handleSync}
                    />
                </div>
            )}

            {/* Settlement Accounts Vault */}
            {analytics?.accounts && analytics.accounts.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Settlement Vault</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active conduits for fee disbursements</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5 gap-2"
                            onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                        >
                            <Plus className="h-3 w-3" />
                            Provision New Node
                        </Button>
                    </div>
                    <div className="flex flex-nowrap overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
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

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-primary" />
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Transaction Stream</h3>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Recent processed liquidity events</p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="h-10 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest"
                            onClick={() => router.push("/dashboard/admin/finance/transactions")}
                        >
                            View All Logs
                        </Button>
                    </div>
                </div>
                
                <div className="p-0">
                    {!analytics?.recentTransactions || analytics.recentTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                <Wallet size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">No Activity Detected</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto">Connect your settlement vault to begin monitoring incoming fee transmissions.</p>
                            </div>
                            <Button 
                                onClick={() => router.push("/dashboard/admin/finance/bank-setup")}
                                className="bg-primary hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-12"
                            >
                                Setup Bank Node
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
                                    <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                        <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payer Entity</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantum</TableHead>
                                        <TableHead className="pr-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Hash</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.recentTransactions.map((t: any) => (
                                        <TableRow key={t.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-all cursor-default">
                                            <TableCell className="pl-8 py-5 font-black text-[11px] text-slate-400 uppercase tracking-tighter">
                                                {format(new Date(t.createdAt), "MMM dd, HH:mm")}
                                            </TableCell>
                                            <TableCell className="font-black text-slate-900 dark:text-white italic uppercase tracking-tight">
                                                {t.student?.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest py-1">
                                                    {t.paymentType || "School Fee"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-black text-slate-900 dark:text-white text-lg tracking-tighter">
                                                ₦{t.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="pr-8 font-mono text-[9px] text-slate-400 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                                                {t.paymentReference}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

