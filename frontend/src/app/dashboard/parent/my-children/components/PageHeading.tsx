import React, { useState } from 'react';
import PendingRequestsDialog from './PendingRequestsDialog';
import { Users, Bell, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';

interface PageHeadingProps {
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function PageHeading({ viewMode, onViewModeChange }: PageHeadingProps) {
  const [showPending, setShowPending] = useState(false)

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-2 sm:mb-4">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <span>Management Hub</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-orange-600">Family Nodes</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 rounded-xl shrink-0">
            <Users size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Linked Students
            </h1>
            <HeaderTooltip
              content="Centralized directory of all children and wards currently linked to your parental portal. Click on any student card to drill down into their complete academic records—including real-time attendance trends, term-by-term assessment scores, scheduled exam timetables, fee obligations, and institutional announcements. Use the 'Link Student' card or 'Pending Requests' to connect additional students using their unique school-issued codes."
              size={18}
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
          Monitor academic intelligence and modify protocol parameters for all registered student nodes in your network.
        </p>
      </div>
      
      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {viewMode && onViewModeChange && (
          <div className="flex shrink-0 items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl h-11 border border-slate-200/60 dark:border-slate-800">
            <button 
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid size={18} strokeWidth={2.5} />
            </button>
            <button 
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <List size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => setShowPending(true)}
          className="h-11 px-4 sm:px-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-colors hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500/50 shadow-sm flex items-center gap-2"
        >
          <Bell className="text-slate-400 dark:text-slate-500" size={16} />
          <span className="hidden sm:inline">Pending Requests</span>
          <span className="sm:hidden">Pending</span>
        </Button>
      </div>

      <PendingRequestsDialog 
        isOpen={showPending} 
        onOpenChange={setShowPending} 
      />
    </div>
  )
}
