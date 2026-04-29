"use client"

import React, { useEffect, useState } from "react"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { financeService } from "@/lib/api/services/financeService"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2, ArrowLeft, Download, Filter, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Admin Transaction Audit Logs Page
 * Provides granular visibility into school fee collections.
 */
export default function AdminTransactionHistoryPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId
    
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (schoolId) {
            financeService.getSchoolAnalytics(schoolId)
                .then(data => setTransactions(data.recentTransactions))
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [schoolId])

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.back()} 
                        className="rounded-full hover:bg-slate-100 h-12 w-12 border-2 border-slate-50"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Transaction Logs</h1>
                        <p className="text-slate-500 font-medium">Internal audit trail for all institutional disbursements.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search by reference..." 
                            className="pl-10 h-12 w-[300px] rounded-xl border-slate-200 bg-white"
                        />
                    </div>
                    <Button variant="outline" className="h-12 rounded-xl border-2 font-bold">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button className="bg-slate-900 text-white h-12 rounded-xl px-6 font-bold hover:bg-slate-800">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/50">
                <CardHeader className="p-10 border-b border-slate-50 dark:border-slate-800">
                    <div>
                        <CardTitle className="text-2xl font-black">Institutional Ledger</CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-1">Granular breakdown of fees, gateway responses, and settlement IDs.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Audit Records...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="bg-slate-50 inline-flex p-6 rounded-full mb-4">
                                <Search className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400">No logs found</h3>
                            <p className="text-slate-400 text-sm mt-2">Transactions will appear here once parents start paying fees.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <TableRow>
                                        <TableHead className="pl-10 py-6 text-slate-400 uppercase text-[10px] font-black tracking-widest">Execution Date</TableHead>
                                        <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Payer/Student</TableHead>
                                        <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Category</TableHead>
                                        <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Amount</TableHead>
                                        <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Gateway Reference</TableHead>
                                        <TableHead className="pr-10 text-slate-400 uppercase text-[10px] font-black tracking-widest">Gateway Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((t) => (
                                        <TableRow key={t.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none">
                                            <TableCell className="pl-10 py-6 font-medium text-slate-500">
                                                {format(new Date(t.createdAt), "MMM dd, yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white">{t.payment?.student?.name}</span>
                                                    <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{t.payment?.student?.studentCode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
                                                    {t.payment?.paymentType || "SCHOOL_FEES"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-black text-slate-900 dark:text-white">₦{t.amount.toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">{t.transactionReference}</TableCell>
                                            <TableCell className="pr-10">
                                                <Badge 
                                                    className={cn(
                                                        "font-black text-[10px] px-3 py-1 scale-90 tracking-widest border-none",
                                                        t.status === "SUCCESS" ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                                                    )}
                                                >
                                                    {t.status}
                                                </Badge>
                                            </TableCell>
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

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
