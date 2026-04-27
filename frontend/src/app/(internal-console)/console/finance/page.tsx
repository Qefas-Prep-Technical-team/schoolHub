"use client"

import { usePlatformFinance } from "@/lib/api/hooks/usePlatformGovernance"
import { 
    DollarSign, 
    TrendingUp, 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownRight,
    Download,
    Filter,
    Search,
    PieChart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function PlatformFinancePage() {
    const { data: transactions, isLoading } = usePlatformFinance()

    const financeMetrics = [
        { title: "Gross Platform Revenue", value: "₦12,450,000", icon: DollarSign, trend: "+12.5%", color: "text-emerald-500" },
        { title: "Active Subscriptions", value: "142", icon: CreditCard, trend: "+4", color: "text-blue-500" },
        { title: "Pending Payouts", value: "₦420,000", icon: TrendingUp, trend: "Nominal", color: "text-amber-500" },
        { title: "Churn Rate", value: "2.4%", icon: PieChart, trend: "-0.5%", color: "text-indigo-500" },
    ]

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Treasury & Revenue</h1>
                    <p className="text-slate-500 font-medium mt-1">Cross-tenant financial aggregation and payout monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                     <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl h-12 px-6 gap-2 shadow-sm">
                        <Download size={18} /> Export Settlement Report
                     </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {financeMetrics.map((card, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden relative group shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.title}</CardTitle>
                            <card.icon className={cn("h-4 w-4", card.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                    "text-[10px] font-bold flex items-center",
                                    card.trend.startsWith('+') ? "text-emerald-400" : "text-slate-400"
                                )}>
                                    {card.trend} {card.trend.includes('%') && <ArrowUpRight size={10} className="ml-0.5" />}
                                </span>
                                <span className="text-[10px] text-slate-600 font-medium tracking-tight">Performance Index</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 dark:bg-slate-950/30">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Consolidated Ledger</h3>
                        <p className="text-xs text-slate-500 font-medium">Real-time stream of all platform-wide financial activities.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input 
                                placeholder="TxID, School, Reference..."
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-lg shadow-sm">
                            <Filter size={14} className="mr-2" /> 
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                            <TableHead className="py-6 pl-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Reference</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Institution</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Amount</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Method</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Status</TableHead>
                            <TableHead className="text-right pr-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-100 dark:border-slate-800">
                                    <TableCell colSpan={6} className="py-4 px-8"><Skeleton className="h-8 w-full bg-slate-100 dark:bg-slate-950" /></TableCell>
                                </TableRow>
                            ))
                        ) : transactions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-medium">No transactions synchronized.</TableCell>
                            </TableRow>
                        ) : (
                            transactions?.map((tx: any) => (
                                <TableRow key={tx.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <TableCell className="pl-8 py-6 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{tx.reference.substring(0, 12)}...</TableCell>
                                    <TableCell className="font-bold text-slate-700 dark:text-slate-200">{tx.school?.name}</TableCell>
                                    <TableCell className="font-black text-slate-900 dark:text-white text-sm">₦{tx.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 rounded-md">
                                            {tx.channel || 'Card'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                tx.status === 'success' ? "bg-emerald-500" : "bg-amber-500"
                                            )}></div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                tx.status === 'success' ? "text-emerald-500" : "text-amber-500"
                                            )}>{tx.status}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8 text-[10px] text-slate-600 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
