"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/lib/api/services/financeService";
import { Landmark, ArrowUpRight, TrendingUp, ShieldCheck, AlertCircle, Wallet, ArrowRight, Loader2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AdminFinanceCardProps {
  schoolId: string;
  primaryColor?: string;
}

export default function AdminFinanceCard({ schoolId, primaryColor = "#2563eb" }: AdminFinanceCardProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-finance-analytics", schoolId],
    queryFn: () => financeService.getSchoolAnalytics(schoolId),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5,
  });

  const totalRevenue = analytics?.totalRevenue || 0;
  const pendingRevenue = analytics?.pendingRevenue || 0;
  const activePayers = analytics?.activePayerCount || 0;
  const isVerified = !!analytics?.isVerified;
  const hasAccounts = (analytics?.accounts?.length || 0) > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden space-y-6">
      {/* Decorative background glow */}
      <div
        className="absolute -right-12 -top-12 size-36 rounded-full opacity-10 pointer-events-none blur-2xl"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="size-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Landmark size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional Finance</h3>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                      <span className="text-xs">ℹ️</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Aggregates all school fee collections, online disbursements, and settlement vault health for this academic period.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-slate-500 font-medium">Liquidity & collections overview</p>
          </div>
        </div>

        <Link
          href="/dashboard/admin/finance"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
          style={{ color: primaryColor }}
        >
          <span>Open Hub</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
          <Loader2 size={16} className="animate-spin text-primary" style={{ color: primaryColor }} />
          <span>Synchronizing financial ledger...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Revenue Highlight Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Collected</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ₦{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
              <TrendingUp size={12} />
              <span>Realtime</span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Fees</span>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                ₦{pendingRevenue.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Payers</span>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                {activePayers} Students
              </p>
            </div>
          </div>

          {/* Gateway Status Badge */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  isVerified ? "bg-emerald-500 animate-pulse" : hasAccounts ? "bg-amber-400" : "bg-slate-300"
                )}
              />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {isVerified ? "Settlement Vault Active" : hasAccounts ? "Verification Pending" : "No Bank Vault Configured"}
              </span>
            </div>

            <Link
              href="/dashboard/admin/finance/bank-setup"
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              style={{ color: primaryColor }}
            >
              {hasAccounts ? "Manage" : "Setup Bank"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
