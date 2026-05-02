"use client"

import React, { useEffect, useState } from "react"
import { financeService } from "@/lib/api/services/financeService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Globe, Loader2, Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function GlobalTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        financeService.getGlobalTransactions()
            .then(setTransactions)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filteredTransactions = transactions.filter(t => 
        t.school?.name.toLowerCase().includes(search.toLowerCase()) ||
        t.payment?.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        t.transactionReference.toLowerCase().includes(search.toLowerCase())
    )

    const handleDownloadCSV = () => {
        const headers = ["Date", "School", "Student", "Parent", "Amount", "Reference", "Status"]
        const rows = filteredTransactions.map(t => [
            format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
            t.school?.name,
            t.payment?.student?.name,
            t.payment?.parent?.fullName,
            t.amount,
            t.transactionReference,
            t.status
        ])

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `global_transactions_${format(new Date(), "yyyyMMdd")}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-muted-foreground font-medium">Fetching global transaction logs...</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Globe className="h-10 w-10 text-blue-600" />
                        Global Transaction Monitor
                    </h1>
                    <p className="text-slate-500 font-medium">Platform-wide financial oversight across all registered schools.</p>
                </div>
                <Button onClick={handleDownloadCSV} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold px-6">
                    <Download className="mr-2 h-5 w-5" />
                    Export Global Data
                </Button>
            </div>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900/50">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black">All Transactions</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1">Search by school, student name, or reference ID.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input 
                                placeholder="Search everything..." 
                                className="pl-12 h-14 rounded-2xl border-slate-100 bg-white shadow-sm focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="pl-8 py-6">Date</TableHead>
                                    <TableHead>School</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-8">Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 dark:border-slate-800">
                                        <TableCell className="pl-8 py-6 text-slate-500 font-medium">
                                            {format(new Date(t.createdAt), "MMM dd, yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-slate-900 dark:text-white">{t.school?.name}</div>
                                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.school?.schoolCode}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-slate-700 dark:text-slate-200">{t.payment?.student?.name}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{t.payment?.parent?.fullName} (Parent)</div>
                                        </TableCell>
                                        <TableCell className="font-black text-slate-900 dark:text-white text-lg">
                                            ₦{t.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "rounded-lg font-black text-[10px] px-2 py-1 uppercase tracking-tighter",
                                                t.status === "SUCCESS" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                            )}>
                                                {t.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-8 font-mono text-xs text-slate-400">
                                            {t.transactionReference}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

