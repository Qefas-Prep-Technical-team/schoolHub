import React, { useState } from 'react';
import PendingRequestsDialog from './PendingRequestsDialog';
import { Users, Bell, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
export default function PageHeading() {
  const [showPending, setShowPending] = useState(false)

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 mb-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          <span>Management Hub</span>
          <ChevronRight size={10} className="text-orange-500" />
          <span className="text-orange-600">Family Nodes</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/30">
            <Users size={24} className="text-white fill-current" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            Linked Students
          </h1>
        </div>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight max-w-xl leading-relaxed">
          Monitor academic intelligence and modify protocol parameters for all registered student nodes in your network.
        </p>
      </div>
      
      <Button
        variant="outline"
        onClick={() => setShowPending(true)}
        className="h-14 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 backdrop-blur-xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 group hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500/50 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 shadow-sm"
      >
        <Bell className="mr-3 text-slate-400 dark:text-slate-500 group-hover:text-orange-500 group-hover:rotate-12 transition-all duration-300" size={18} />
        Pending Requests
      </Button>

      <PendingRequestsDialog 
        isOpen={showPending} 
        onOpenChange={setShowPending} 
      />
    </div>
  )
}
