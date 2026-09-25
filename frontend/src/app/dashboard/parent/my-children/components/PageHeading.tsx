import React, { useState } from 'react';
import PendingRequestsDialog from './PendingRequestsDialog';
import { Users, Bell, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PageHeading() {
  const [showPending, setShowPending] = useState(false)

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 mb-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <span>Management Hub</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-orange-600">Family Nodes</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
            <Users size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Linked Students
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
          Monitor academic intelligence and modify protocol parameters for all registered student nodes in your network.
        </p>
      </div>
      
      <Button
        variant="outline"
        onClick={() => setShowPending(true)}
        className="h-11 px-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500/50 shadow-sm flex items-center gap-2"
      >
        <Bell className="text-slate-400 dark:text-slate-500" size={16} />
        Pending Requests
      </Button>

      <PendingRequestsDialog 
        isOpen={showPending} 
        onOpenChange={setShowPending} 
      />
    </div>
  )
}
