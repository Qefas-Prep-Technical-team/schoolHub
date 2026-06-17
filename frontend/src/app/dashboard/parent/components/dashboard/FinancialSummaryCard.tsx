'use client'
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useParentStore } from '@/lib/api/hooks/useParentStore'

const fmt = (n: number) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`
  return `₦${n.toFixed(2)}`
}

export default function FinancialSummaryCard() {
  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/[0.08] to-transparent pointer-events-none" />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3 opacity-60">
          <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-2xl ring-1 ring-orange-500/20">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Parent Balance</h3>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Financial Hub</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 relative z-10">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 ring-4 ring-white dark:ring-slate-900 shadow-sm border border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-[28px] text-slate-400">lock</span>
        </div>
        <h4 className="text-[14px] font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Coming Soon</h4>
        <p className="text-[11px] text-slate-500 font-medium text-center max-w-[200px] leading-relaxed">
          Integrated fee management and online payment gateways are currently in development.
        </p>
      </div>

      <div className="mt-auto w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
        Feature Locked <span className="material-symbols-outlined text-[16px]">credit_card_off</span>
      </div>
    </div>
  )
}
