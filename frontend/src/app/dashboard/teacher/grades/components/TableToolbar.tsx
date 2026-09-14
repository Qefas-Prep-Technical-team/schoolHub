import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  X,
  Send,
  Loader2
} from "lucide-react";

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onExport: () => void;
  onPublishAll?: () => void;
  isPublishingAll?: boolean;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onFilter,
  onSort,
  onExport,
  onPublishAll,
  isPublishingAll
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="flex flex-1 items-center gap-3 min-w-[280px]">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <input
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-10 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
            placeholder="Search for a student..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={onFilter}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95"
          >
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button
            onClick={onSort}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95"
          >
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onPublishAll && (
          <button
            onClick={onPublishAll}
            disabled={isPublishingAll}
            className="flex h-10 items-center justify-center gap-2.5 rounded-xl border border-emerald-600 bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
          >
            {isPublishingAll ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
            <span>Publish All</span>
          </button>
        )}
        <button
          onClick={onExport}
          className="flex h-10 items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all active:scale-95"
        >
          <Download size={14} />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  );
};

export default TableToolbar;
