"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
    Landmark,
    TrendingUp,
    Users,
    Wallet,
    Download,
    ChevronLeft,
    ShieldCheck,
    Plus,
    CreditCard,
    Clock,
    Lock,
    Sparkles,
    AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FinanceHeaderAndStatsProps {
    isVerified?: boolean
    isSchoolPaidPlan: boolean
    schoolPlanName: string
    totalRevenue: number
    pendingRevenue: number
    activePayers: number
    averageTransaction: number
    onBack: () => void
    onOpenManualModal: () => void
    onExportCSV: () => void
    onOpenAddBankModal: () => void
}

export function FinanceHeaderAndStats({
    isVerified,
    isSchoolPaidPlan,
    schoolPlanName,
    totalRevenue,
    pendingRevenue,
    activePayers,
    averageTransaction,
    onBack,
    onOpenManualModal,
    onExportCSV,
    onOpenAddBankModal,
}: FinanceHeaderAndStatsProps) {
    const stats = [
        {
            title: "Total Revenue Collected",
            value: `₦${totalRevenue.toLocaleString()}`,
            caption: "Verified online and manual payments",
            icon: TrendingUp,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            title: "Pending Collections",
            value: `₦${pendingRevenue.toLocaleString()}`,
            caption: "Awaiting bank confirmation",
            icon: Wallet,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
        },
        {
            title: "Active Fee Payers",
            value: activePayers.toLocaleString(),
            caption: "Parents and students who paid",
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Average Payment",
            value: `₦${averageTransaction.toLocaleString()}`,
            caption: "Average payment per transaction",
            icon: CreditCard,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
    ]

    return (
        <>
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                <div className="space-y-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-2.5 rounded-xl h-8 text-xs font-bold"
                        onClick={onBack}
                    >
                        <ChevronLeft size={16} className="mr-1" /> Back to Overview
                    </Button>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Finance Hub
                            </h1>
                            {isVerified ? (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        Gateway Verified
                                    </span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onOpenAddBankModal}
                                    className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 cursor-pointer transition-colors"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        Setup Pending (Add Bank)
                                    </span>
                                </button>
                            )}
                            <div
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                    isSchoolPaidPlan
                                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                                        : "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20"
                                )}
                            >
                                {isSchoolPaidPlan ? (
                                    <Sparkles className="h-3.5 w-3.5" />
                                ) : (
                                    <AlertCircle className="h-3.5 w-3.5" />
                                )}
                                <span>{schoolPlanName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                                <Lock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                    256-Bit Encrypted
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
                            Real-time tracking of student fee payments, transcript clearances, and bank payouts
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={onOpenManualModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white h-12 px-5 rounded-2xl font-bold shadow-lg shadow-blue-600/25 dark:shadow-blue-900/40 gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={18} />
                        Record Fee Payment
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onExportCSV}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 px-5 rounded-2xl font-bold shadow-sm gap-2"
                    >
                        <Download size={16} />
                        Export Transactions
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={onOpenAddBankModal}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 h-12 px-5 rounded-2xl font-bold shadow-sm gap-2 cursor-pointer"
                    >
                        <Landmark size={16} />
                        Add Bank Account
                    </Button>
                </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div
                                className={cn(
                                    "size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                    stat.bg,
                                    stat.color
                                )}
                            >
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
                                    stat.bg,
                                    stat.color,
                                    stat.border
                                )}
                            >
                                Live
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {stat.title}
                            </span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                                {stat.caption}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

