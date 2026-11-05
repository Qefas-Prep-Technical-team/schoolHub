"use client"

import React from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    TrendingUp, GraduationCap, CreditCard, Edit2, ShieldCheck,
    Landmark, ArrowRight, Download, CheckCircle2, Clock, Receipt, Sparkles, Lock,
} from "lucide-react"
import { FinanceAnalytics, FinanceTransaction } from "@/lib/api/services/financeService"
import { cn } from "@/lib/utils"

interface FinanceTranscriptsTabProps {
    analytics: FinanceAnalytics | null; transactions: FinanceTransaction[]
    configuredTranscriptFee: number; isSchoolPaidPlan: boolean; schoolPlanName: string
    onOpenFeeModal: () => void; onOpenAddBankModal: () => void
    onExportCSV: () => void; onOpenReceipt: (tx: FinanceTransaction) => void
}

export function FinanceTranscriptsTab({
    analytics, transactions, configuredTranscriptFee, isSchoolPaidPlan,
    schoolPlanName, onOpenFeeModal, onOpenAddBankModal, onExportCSV, onOpenReceipt,
}: FinanceTranscriptsTabProps) {
    const transcriptList =
        (analytics?.transcriptTransactions || []).length > 0
            ? analytics!.transcriptTransactions!
            : transactions.filter((t) => (t.paymentType || "").toUpperCase().includes("TRANSCRIPT"))

    return (
        <div className="space-y-6">
            {/* Transcript Financial Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp size={22} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Revenue</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transcript Revenue</span>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">₦{(analytics?.transcriptRevenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">From student & alumni transcript clearances</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <GraduationCap size={22} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-600 border-blue-500/20">Completed</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Requests</span>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{analytics?.transcriptCount || 0}</p>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">Official transcripts unlocked & cleared</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <CreditCard size={22} strokeWidth={2.5} />
                        </div>
                        <Button
                            variant="ghost" size="sm" onClick={onOpenFeeModal}
                            className="h-7 px-2.5 rounded-lg text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 gap-1 cursor-pointer"
                            title="Click to edit transcript fee"
                        >
                            <Edit2 size={11} /><span>Set Fee</span>
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transcript Fee</span>
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">₦{configuredTranscriptFee.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">
                            {configuredTranscriptFee === 0 && isSchoolPaidPlan ? "Complimentary for active students" : "Configured per-term / alumni clearance fee"}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <ShieldCheck size={22} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">{schoolPlanName}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payout Method</span>
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">Flutterwave Split</p>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">Deposited into registered bank account</p>
                    </div>
                </div>
            </div>

            {/* Institutional Tier & Transcript Access Matrix Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                Student & Alumni Transcript Access Rules
                            </h4>
                            <Badge
                                className={cn(
                                    "text-[10px] font-black uppercase",
                                    isSchoolPaidPlan
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}
                            >
                                School Tier: {schoolPlanName}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            How transcript security and paywall enforcement work across student categories in your institution:
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenFeeModal}
                        className="rounded-xl h-9 px-3.5 text-xs font-bold gap-1.5 shrink-0"
                    >
                        <Edit2 size={13} />
                        Configure Clearance Fee (₦{configuredTranscriptFee.toLocaleString()})
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <GraduationCap size={14} /> Graduated Students (Alumni)
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                Mandatory Clearance
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Graduated students always require clearance payment (₦{Math.max(configuredTranscriptFee, 5000).toLocaleString()} if set to ₦0) for a 30-day verified pass and 1 official stamped PDF copy.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                <Sparkles size={14} /> Active Students (Paid School Plan)
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                {configuredTranscriptFee === 0 ? "Complimentary" : `₦${configuredTranscriptFee.toLocaleString()} Fee`}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            When your school is on an active Basic/Premium plan, setting the fee to <strong>₦0</strong> grants enrolled students complimentary transcript access; setting &gt; ₦0 charges per term.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Lock size={14} /> Free-Tier School Students
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                Locked on Free Tier
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Schools on the platform Free Tier do not include complimentary student transcript access. Scores and CGPAs are masked until the school upgrades or the student unlocks per term.
                        </p>
                    </div>
                </div>
            </div>

            {/* Conduit Informational Banner */}
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                        <Landmark className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-base">
                            Direct Bank Deposits for Transcript Fees
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-2xl">
                            When graduated students or enrolled learners pay to download their official academic transcripts, payments are automatically deposited into your connected school bank account.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={onOpenAddBankModal}
                    variant="outline"
                    className="rounded-xl h-10 px-4 text-xs font-bold whitespace-nowrap bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 cursor-pointer"
                >
                    Configure Bank Account
                    <ArrowRight size={14} className="ml-1.5" />
                </Button>
            </div>

            {/* Transcripts Transactions Ledger */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap size={18} className="text-blue-600" />
                            Transcript Payments ({transcriptList.length})
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                            Log of verified and pending payments for official student transcripts.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onExportCSV} className="rounded-xl text-xs font-bold gap-2">
                        <Download size={14} />
                        Export Transcript Payments
                    </Button>
                </div>

                {transcriptList.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 px-4">
                        <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                            <GraduationCap size={32} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Transcript Fees Yet</h4>
                        <p className="text-xs text-slate-400 max-w-sm">
                            When students or alumni pay to unlock their transcripts or session records, transactions will appear here with live payment status.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                <TableRow className="border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="pl-6 py-4 text-slate-400 uppercase text-[10px] font-black tracking-wider">Date & Time</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Student</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Academic Session</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Amount Paid</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Payout Method</TableHead>
                                    <TableHead className="text-slate-400 uppercase text-[10px] font-black tracking-wider">Status</TableHead>
                                    <TableHead className="pr-6 text-right text-slate-400 uppercase text-[10px] font-black tracking-wider">Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transcriptList.map((t) => (
                                    <TableRow key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <TableCell className="pl-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                            {format(new Date(t.createdAt), "MMM d, yyyy • HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {t.student?.name || "Student"}
                                                </span>
                                                {t.student?.studentCode && (
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        ID: {t.student.studentCode}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t.session || "Cumulative / All Sessions"}
                                        </TableCell>
                                        <TableCell className="font-black text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                            ₦{t.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold text-slate-500">
                                            <span className="inline-flex items-center gap-1">
                                                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                                                {t.channel || "Flutterwave Subaccount"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {t.status === "SUCCESS" || t.status === "COMPLETED" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle2 size={12} /> Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                    <Clock size={12} /> Pending
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onOpenReceipt(t)}
                                                className="h-8 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
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
                )}
            </div>
        </div>
    )
}
