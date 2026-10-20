'use client'

import { Wallet, Lock, CreditCard } from 'lucide-react'
import { HeaderTooltip } from './HeaderTooltip'

export default function FinancialSummaryCard() {
  return (
    <div className="group relative bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col w-full transition-all duration-300 hover:shadow-md overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/[0.08] to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl sm:rounded-2xl border border-orange-500/20 shrink-0">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                Parent Balance
              </h3>
              <HeaderTooltip content="Direct overview of tuition billing, term dues, receipt archives, and connected payment channels." />
            </div>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
              Financial Hub
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 relative z-10 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl flex items-center justify-center mb-3 ring-4 ring-orange-500/10 shadow-sm border border-slate-200 dark:border-slate-700">
          <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 dark:text-slate-500" />
        </div>
        <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1.5">
          Feature Under Active Rollout
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium max-w-[220px] leading-relaxed">
          Integrated school fee management and instant online receipts are currently being provisioned for your school.
        </p>
      </div>

      <div className="mt-auto w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
        <CreditCard size={14} className="opacity-70" />
        <span>Gateway Provisioning</span>
      </div>
    </div>
  )
}
