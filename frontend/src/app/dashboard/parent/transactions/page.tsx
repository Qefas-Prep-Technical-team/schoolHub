"use client"

import React, { useEffect, useState } from "react"
import { financeService } from "@/lib/api/services/financeService"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2, History } from "lucide-react"

/**
 * Parent Transaction History Page
 */
export default function ParentTransactionPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await financeService.getParentHistory()
                setTransactions(data)
            } catch (error) {
                console.error("Failed to fetch history", error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
                <p className="text-muted-foreground">Track all your student fee payments and their current processing status.</p>
            </div>
            
            <Card className="border-none shadow-md">
                <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <History className="h-6 w-6 text-blue-500" />
                        Payment Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-sm font-medium text-muted-foreground">Loading transaction history...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-2 border-t mt-4">
                            <History className="h-12 w-12 text-slate-200" />
                            <p className="text-lg font-semibold text-slate-400">No transactions found</p>
                            <p className="text-sm text-slate-400">Your future fee payments will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                    <TableRow>
                                        <TableHead className="pl-6 py-4">Date</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead className="pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((t) => (
                                        <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                            <TableCell className="pl-6 py-4 font-medium">
                                                {format(new Date(t.createdAt), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell>{t.student?.name}</TableCell>
                                            <TableCell>
                                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                                                    {t.paymentType}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-bold">₦{t.amount.toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground">{t.paymentReference}</TableCell>
                                            <TableCell className="pr-6">
                                                <Badge 
                                                    className={cn(
                                                        "font-semibold",
                                                        t.status === "SUCCESS" ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : 
                                                        t.status === "PENDING" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none" :
                                                        "bg-red-100 text-red-700 hover:bg-red-100 border-none"
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
