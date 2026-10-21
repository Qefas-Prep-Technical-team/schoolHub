"use client"
import React from 'react'
import { ChevronLeft, ChevronRight, Download, Plus, Loader2 } from 'lucide-react'

interface TimetableToolbarProps {
  currentWeek: string
  onPreviousWeek: () => void
  onNextWeek: () => void
  onAddClass: () => void
  onPrint: () => void
  isExporting?: boolean
  primaryColor?: string
}

export default function TimetableToolbar({ 
  currentWeek, 
  onPreviousWeek, 
  onNextWeek, 
  onAddClass,
  onPrint,
  isExporting,
  primaryColor = '#2563eb'
}: TimetableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4 p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      {/* Week Navigator */}
      <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-800/60 p-1 sm:p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <button 
          type="button"
          onClick={onPreviousWeek}
          aria-label="Previous week"
          className="size-9 sm:size-8 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        
        <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 px-2 select-none tracking-tight text-center">
          {currentWeek}
        </span>
        
        <button 
          type="button"
          onClick={onNextWeek}
          aria-label="Next week"
          className="size-9 sm:size-8 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      
      {/* Actions */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
        <button 
          type="button"
          onClick={onPrint}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 rounded-xl h-10 px-3 sm:px-4 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-2xs"
        >
          {isExporting ? (
            <>
              <Loader2 className="animate-spin" size={15} />
              <span className="truncate">Exporting...</span>
            </>
          ) : (
            <>
              <Download size={15} />
              <span className="truncate sm:hidden">Export</span>
              <span className="truncate hidden sm:inline">Download Timetable</span>
            </>
          )}
        </button>

        <button 
          type="button"
          onClick={onAddClass}
          className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl h-10 px-3 sm:px-5 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="truncate sm:hidden">Add</span>
          <span className="truncate hidden sm:inline">Add Period</span>
        </button>
      </div>
    </div>
  )
}
