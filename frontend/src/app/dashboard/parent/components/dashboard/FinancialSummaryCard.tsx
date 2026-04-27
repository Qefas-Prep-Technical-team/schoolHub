import React from 'react'

export default function FinancialSummaryCard() {
  return (
    <div className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-white/10 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30 overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/[0.08] to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600/10 text-orange-600 rounded-2xl ring-1 ring-orange-500/20 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[13px] text-slate-900 dark:text-white uppercase tracking-tight">Parent Balance</h3>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Financial Hub</span>
          </div>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-orange-500 transition-colors">
          <span className="material-symbols-outlined text-[20px]">payments</span>
        </div>
      </div>
      
      <div className="flex flex-col mb-6">
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">$1,250</span>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-1.5 py-0.5 rounded ring-1 ring-rose-500/20">Due By Oct 31</span>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Outstanding School Fees</p>
      </div>
      
      {/* Mini Progress Bar */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
          <span className="text-slate-500">Amount Paid</span>
          <span className="text-orange-600">$4,750 / $6,000</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
          <div className="h-full bg-orange-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,88,12,0.3)]" style={{ width: '79%' }} />
        </div>
      </div>
      
      <button className="mt-auto w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest">
        Make A Payment <span className="material-symbols-outlined text-[16px]">credit_card</span>
      </button>
    </div>
  )
}
