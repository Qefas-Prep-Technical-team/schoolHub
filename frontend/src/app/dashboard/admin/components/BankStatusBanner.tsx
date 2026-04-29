"use client"

import React from "react"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BankStatusBannerProps {
    status: "active" | "pending" | "unverified" | "none";
}

export function BankStatusBanner({ status }: BankStatusBannerProps) {
    if (status === "active") return null;
    
    // If no account is connected, we don't need a warning banner here as the page shows setup fields
    if (status === "none") return null;

    const isUnverified = status === "unverified";

    return (
        <div className={cn(
            "p-5 rounded-2xl flex gap-4 items-center border",
            isUnverified 
                ? "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                : "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
        )}>
            <div className={cn(
                "p-2 rounded-xl",
                isUnverified ? "bg-red-100 dark:bg-red-900/40" : "bg-amber-100 dark:bg-amber-900/40"
            )}>
                {isUnverified ? <AlertCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div className="text-sm">
                <p className="font-black uppercase tracking-widest text-[10px] mb-0.5">
                    {isUnverified ? "Payment Account Restricted" : "Verification Outstanding"}
                </p>
                <p className="font-semibold leading-relaxed">
                    {isUnverified 
                        ? "School payment gateway is disabled due to verification failure. Please review your bank details."
                        : "Your account is currently under review. Fee payments will be enabled once verified."}
                </p>
            </div>
        </div>
    )
}
