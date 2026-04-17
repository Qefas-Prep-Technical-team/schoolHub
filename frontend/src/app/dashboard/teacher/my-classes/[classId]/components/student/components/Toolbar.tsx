'use client';

import { Search, ListFilter, UserPlus, FileDown, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStudent: () => void;
  filters: string[];
  onFilterClick: (filter: string) => void;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  onAddStudent,
  filters,
  onFilterClick,
}: ToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
        {/* Modern Search Field */}
        <div className="relative group flex-1 max-w-md">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
              <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
           </div>
           <input
             type="text"
             placeholder="Search Students by Name or ID..."
             value={searchQuery}
             onChange={(e) => onSearchChange(e.target.value)}
             className="w-full h-14 pl-14 pr-6 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-sm font-bold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 placeholder:italic placeholder:font-medium"
           />
        </div>

        {/* Filter Pills Toggle */}
        <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="h-14 px-6 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
            >
               <SlidersHorizontal size={16} className="text-primary" />
               Filters
               <ChevronDown size={14} className="text-slate-400" />
            </motion.button>
            
            <div className="hidden sm:flex items-center gap-2 px-6 h-14 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Active</span>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <motion.button
            whileTap={{ scale: 0.95 }}
            className="h-14 px-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:border-primary/30 transition-all flex items-center justify-center shadow-lg shadow-black/5"
         >
            <FileDown size={20} />
         </motion.button>
         <motion.button
           whileTap={{ scale: 0.95 }}
           onClick={onAddStudent}
           className="h-14 px-8 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3 hover:scale-105 transition-all text-sm font-black uppercase tracking-widest whitespace-nowrap"
         >
           <UserPlus size={20} />
           Register Student
         </motion.button>
      </div>
    </div>
  );
}