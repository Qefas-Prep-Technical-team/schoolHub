'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  FilterX, 
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterKeys = "class" | "subject" | "status" | "date";

interface FilterChipsProps {
  filters: {
    class: string;
    subject: string;
    status: string;
    date: string;
  };
  classes?: { id: string; name: string }[];
  subjects?: { id: string; name: string }[];
  onFilterChange: (filterType: FilterKeys, value: string) => void;
  onClearFilters: () => void;
}

const filterOptions = {
  status: ['Published', 'Completed', 'Draft'],
  date: ['Last Week', 'Last Month', 'Last 3 Months', 'This Year'],
};

export default function FilterChips({ 
  filters, 
  classes = [], 
  subjects = [], 
  onFilterChange, 
  onClearFilters 
}: FilterChipsProps) {
  const [openFilter, setOpenFilter] = useState<FilterKeys | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;
  const hasActiveFilters = activeFiltersCount > 0;

  const selectedClass = classes.find(c => c.id === filters.class);
  const selectedClassName = selectedClass ? selectedClass.name : (filters.class || 'All Classes');

  const selectedSubject = subjects.find(s => s.id === filters.subject);
  const selectedSubjectName = selectedSubject ? selectedSubject.name : (filters.subject || 'All Subjects');

  // Handle outside clicks to close active dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (key: FilterKeys) => {
    setOpenFilter(prev => prev === key ? null : key);
  };

  const handleSelect = (key: FilterKeys, value: string) => {
    onFilterChange(key, value);
    setOpenFilter(null);
  };

  return (
    <div ref={containerRef} className="pt-2 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Filter Pills Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Subtle Label (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 select-none">
            <Filter size={13} className="text-emerald-500" />
            <span>Filters:</span>
          </div>

          {/* Responsive 2-column mobile grid & flex row on tablet/desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* 1. Class Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('class')}
                className={`w-full sm:w-auto flex h-10 items-center justify-between gap-2 rounded-xl px-3 sm:px-3.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filters.class
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
                title="Filter by Class"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <GraduationCap size={15} className={filters.class ? 'text-white' : 'text-emerald-500'} strokeWidth={2.5} />
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">{selectedClassName}</span>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 shrink-0 ${openFilter === 'class' ? 'rotate-180' : ''} ${filters.class ? 'text-white/80' : 'text-slate-400'}`} 
                />
              </button>

              <AnimatePresence>
                {openFilter === 'class' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 z-50 min-w-[200px] max-w-[260px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 backdrop-blur-xl"
                  >
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleSelect('class', '')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                          !filters.class
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>All Classes</span>
                        {!filters.class && <Check size={14} className="text-emerald-500" />}
                      </button>

                      {classes.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400">No classes assigned</div>
                      ) : (
                        classes.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelect('class', c.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                              filters.class === c.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            {filters.class === c.id && <Check size={14} className="text-emerald-500 shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Subject Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('subject')}
                className={`w-full sm:w-auto flex h-10 items-center justify-between gap-2 rounded-xl px-3 sm:px-3.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filters.subject
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
                title="Filter by Subject"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen size={15} className={filters.subject ? 'text-white' : 'text-emerald-500'} strokeWidth={2.5} />
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">{selectedSubjectName}</span>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 shrink-0 ${openFilter === 'subject' ? 'rotate-180' : ''} ${filters.subject ? 'text-white/80' : 'text-slate-400'}`} 
                />
              </button>

              <AnimatePresence>
                {openFilter === 'subject' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 z-50 min-w-[200px] max-w-[260px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 backdrop-blur-xl"
                  >
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleSelect('subject', '')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                          !filters.subject
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>All Subjects</span>
                        {!filters.subject && <Check size={14} className="text-emerald-500" />}
                      </button>

                      {subjects.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400">No subjects assigned</div>
                      ) : (
                        subjects.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSelect('subject', sub.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                              filters.subject === sub.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                            {filters.subject === sub.id && <Check size={14} className="text-emerald-500 shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Status Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('status')}
                className={`w-full sm:w-auto flex h-10 items-center justify-between gap-2 rounded-xl px-3 sm:px-3.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filters.status
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
                title="Filter by Status"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles size={15} className={filters.status ? 'text-white' : 'text-emerald-500'} strokeWidth={2.5} />
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">
                    {filters.status ? (filters.status.charAt(0).toUpperCase() + filters.status.slice(1)) : 'All Statuses'}
                  </span>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 shrink-0 ${openFilter === 'status' ? 'rotate-180' : ''} ${filters.status ? 'text-white/80' : 'text-slate-400'}`} 
                />
              </button>

              <AnimatePresence>
                {openFilter === 'status' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 z-50 min-w-[170px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 backdrop-blur-xl"
                  >
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleSelect('status', '')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                          !filters.status
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>All Statuses</span>
                        {!filters.status && <Check size={14} className="text-emerald-500" />}
                      </button>

                      {filterOptions.status.map((status) => {
                        const isSelected = filters.status === status.toLowerCase();
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleSelect('status', status.toLowerCase())}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{status}</span>
                            {isSelected && <Check size={14} className="text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Date Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('date')}
                className={`w-full sm:w-auto flex h-10 items-center justify-between gap-2 rounded-xl px-3 sm:px-3.5 border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filters.date
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-800/40 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-emerald-900/40'
                }`}
                title="Filter by Date"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar size={15} className={filters.date ? 'text-white' : 'text-emerald-500'} strokeWidth={2.5} />
                  <span className="truncate max-w-[90px] sm:max-w-[130px]">{filters.date || 'Any Time'}</span>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 shrink-0 ${openFilter === 'date' ? 'rotate-180' : ''} ${filters.date ? 'text-white/80' : 'text-slate-400'}`} 
                />
              </button>

              <AnimatePresence>
                {openFilter === 'date' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 z-50 min-w-[170px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 backdrop-blur-xl"
                  >
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleSelect('date', '')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                          !filters.date
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>Any Time</span>
                        {!filters.date && <Check size={14} className="text-emerald-500" />}
                      </button>

                      {filterOptions.date.map((date) => {
                        const isSelected = filters.date === date;
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => handleSelect('date', date)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{date}</span>
                            {isSelected && <Check size={14} className="text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Reset Filters Action */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={onClearFilters}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3.5 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all text-xs font-bold active:scale-95 shrink-0 w-full sm:w-auto shadow-sm"
              title="Reset all filters"
            >
              <FilterX size={15} />
              <span>Reset Filters ({activeFiltersCount})</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
