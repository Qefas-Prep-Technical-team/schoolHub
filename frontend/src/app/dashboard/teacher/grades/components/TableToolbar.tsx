import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  X,
  Send,
  Loader2,
  LayoutGrid,
  List
} from "lucide-react";
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onExport: () => void;
  onPublishAll?: () => void;
  isPublishingAll?: boolean;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onFilter,
  onSort,
  onExport,
  onPublishAll,
  isPublishingAll,
  viewMode = 'table',
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:px-6 sm:py-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-emerald-100/60 dark:border-emerald-800/30">
      {/* Search Bar + Filters/Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 flex-1">
        <div className="relative w-full sm:max-w-xs md:max-w-sm group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-9 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-sm"
            placeholder="Search for a student..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={onFilter}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <button
              onClick={onSort}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
          </div>

          {/* Grid / Table View Switcher */}
          {onViewModeChange && (
            <div className="flex items-center gap-1.5 sm:ml-2">
              <HeaderTooltip content="Toggle between detailed tabular grade rows and visual responsive scholar grade tiles." />
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 p-1 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 backdrop-blur-sm shadow-inner">
                <button
                  type="button"
                  onClick={() => onViewModeChange('table')}
                  className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none ${
                    viewMode === 'table' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="Table View"
                >
                  <List size={15} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('grid')}
                  className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Publish All & Export */}
      <div className="flex items-center gap-2 justify-end">
        {onPublishAll && (
          <button
            onClick={onPublishAll}
            disabled={isPublishingAll}
            className="flex-1 sm:flex-none flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 sm:px-4 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 cursor-pointer"
          >
            {isPublishingAll ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
            <span className="whitespace-nowrap">Publish All</span>
          </button>
        )}
        <button
          onClick={onExport}
          className="flex-1 sm:flex-none flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 sm:px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Download size={14} />
          <span className="whitespace-nowrap">Export</span>
        </button>
      </div>
    </div>
  );
};

export default TableToolbar;
