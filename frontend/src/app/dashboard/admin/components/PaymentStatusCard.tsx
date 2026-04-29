"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Clock, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PaymentStatusCardProps {
    status: {
        color: string;
        message: string;
        label: string;
        status: string;
    };
    schoolId?: string;
    onRefresh?: () => void;
}

export function PaymentStatusCard({ status, schoolId, onRefresh }: PaymentStatusCardProps) {
    const isRed = status.color === "red";
    const isYellow = status.color === "yellow";
    const isGreen = status.color === "green";

    return (
        <Card className={cn(
            "border-none shadow-xl rounded-[2rem] overflow-hidden transition-all duration-500",
            isRed && "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-900/50",
            isYellow && "bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-200 dark:ring-amber-900/50",
            isGreen && "bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-200 dark:ring-emerald-900/50"
        )}>
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className={cn(
                            "p-4 rounded-2xl",
                            isRed && "bg-red-100 text-red-600",
                            isYellow && "bg-amber-100 text-amber-600",
                            isGreen && "bg-emerald-100 text-emerald-600"
                        )}>
                            {isRed && <AlertCircle className="h-8 w-8" />}
                            {isYellow && <Clock className="h-8 w-8" />}
                            {isGreen && <CheckCircle2 className="h-8 w-8" />}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{status.label}</h3>
                                <Badge className={cn(
                                    "rounded-md font-bold uppercase tracking-wider text-[10px]",
                                    isRed && "bg-red-600 hover:bg-red-700",
                                    isYellow && "bg-amber-600 hover:bg-amber-700",
                                    isGreen && "bg-emerald-600 hover:bg-emerald-700"
                                )}>
                                    {status.status}
                                </Badge>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                                {status.message}
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        {isRed ? (
                            <div className="flex flex-col gap-3">
                                <Link href="/dashboard/admin/finance/bank-setup">
                                    <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl h-14 px-8 font-black shadow-lg shadow-red-500/25 gap-2 group">
                                        Fix Bank Details
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                {onRefresh && (
                                    <Button onClick={onRefresh} variant="ghost" className="text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 gap-2">
                                        <RefreshCw className="h-4 w-4" />
                                        Sync with Bank
                                    </Button>
                                )}
                            </div>
                        ) : isYellow ? (
                            <div className="flex flex-col gap-3">
                                <Button disabled className="w-full md:w-auto bg-amber-600 opacity-80 text-white rounded-xl h-14 px-8 font-black gap-2 text-lg">
                                    <Clock className="h-5 w-5" />
                                    Awaiting Verification
                                </Button>
                                {onRefresh && (
                                    <Button onClick={onRefresh} variant="ghost" className="text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/40 gap-2">
                                        <RefreshCw className="h-4 w-4" />
                                        Sync with Bank
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Button disabled className="w-full md:w-auto bg-emerald-600 opacity-80 text-white rounded-xl h-14 px-8 font-black gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Payments Enabled
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
