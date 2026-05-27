'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, UserPlus, FileDown, SlidersHorizontal, X, ChevronDown, Check, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type StudentFilters = {
  gender: string;
  status: string;
  performance: string;
};

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStudent: () => void;
  onExport: () => void;
  filters: StudentFilters;
  onFilterChange: (filters: StudentFilters) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

const FilterChip = ({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`h-9 px-3 flex items-center gap-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
          value
            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
        }`}
      >
        {label}
        {selected && (
          <span className={`rounded px-1 py-0.5 text-[8px] font-black ${value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {selected.label}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 min-w-[150px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
          >
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!value ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                {!value && <Check size={7} className="text-white" strokeWidth={3} />}
              </span>
              All
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${value === opt.value ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                  {value === opt.value && <Check size={7} className="text-white" strokeWidth={3} />}
                </span>
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Toolbar({
  searchQuery, onSearchChange, onAddStudent, onExport,
  filters, onFilterChange, viewMode, onViewModeChange,
}: ToolbarProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Search */}
      <div className="relative group flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9 pl-9 pr-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-xs font-semibold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 placeholder:font-normal"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-9 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

      {/* Filter label */}
      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <SlidersHorizontal size={12} />
        Filter:
      </div>

      {/* Filter chips */}
      <FilterChip label="Gender" value={filters.gender}
        options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
        onChange={(v) => onFilterChange({ ...filters, gender: v })}
      />
      <FilterChip label="Status" value={filters.status}
        options={[{ label: 'Active', value: 'active' }, { label: 'Suspended', value: 'suspended' }, { label: 'Transferred', value: 'transferred' }]}
        onChange={(v) => onFilterChange({ ...filters, status: v })}
      />
      <FilterChip label="Performance" value={filters.performance}
        options={[{ label: 'High', value: 'High' }, { label: 'Medium', value: 'Medium' }, { label: 'Low', value: 'Low' }]}
        onChange={(v) => onFilterChange({ ...filters, performance: v })}
      />

      <AnimatePresence>
        {activeCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onFilterChange({ gender: '', status: '', performance: '' })}
            className="h-9 px-3 flex items-center gap-1 rounded-xl border border-dashed border-rose-300 dark:border-rose-800 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <X size={10} strokeWidth={3} /> Clear ({activeCount})
          </motion.button>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="h-9 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

      {/* View mode toggle */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onViewModeChange('list')}
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <List size={15} />
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutGrid size={15} />
        </button>
      </div>

      {/* Export */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onExport}
        className="h-9 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-primary/40 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
      >
        <FileDown size={14} />
        Export
      </motion.button>

      {/* Add Student */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAddStudent}
        className="h-9 px-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-all text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
      >
        <UserPlus size={14} />
        Add Student
      </motion.button>
    </div>
  );
}