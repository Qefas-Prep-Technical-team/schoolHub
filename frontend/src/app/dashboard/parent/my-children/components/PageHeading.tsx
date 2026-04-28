import React, { useState } from 'react'
import PendingRequestsDialog from './PendingRequestsDialog'

export default function PageHeading() {
  const [showPending, setShowPending] = useState(false)

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Children
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
          Manage your children&apos;s academic information
        </p>
      </div>
      
      <button
        onClick={() => setShowPending(true)}
        className="group flex items-center justify-center gap-2 h-11 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700/50 rounded-xl shadow-sm hover:border-orange-500/50 hover:text-orange-500 transition-all active:scale-95"
      >
        <span className="material-symbols-outlined text-[20px]">group</span>
        <span className="text-sm font-bold tracking-tight">View Requests</span>
      </button>

      <PendingRequestsDialog 
        isOpen={showPending} 
        onOpenChange={setShowPending} 
      />
    </div>
  )
}
