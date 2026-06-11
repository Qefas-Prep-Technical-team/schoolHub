'use client';

import { ChevronDown, Layers, BookOpen, GraduationCap, Calendar, Clock, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface FilterChipsProps {
    filters: {
        academicYear: string;
        term: string;
        level: string;
        class: string;
        subject: string;
    };
    options: {
        academicYear: string[];
        term: string[];
        level: string[];
        class: string[];
        subject: string[];
    };
    onFilterChange: (filterType: keyof FilterChipsProps['filters'], value: string) => void;
    onClearFilters: () => void;
}

export default function FilterChips({ filters, options, onFilterChange, onClearFilters }: FilterChipsProps) {
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    const [openFilter, setOpenFilter] = useState<string | null>(null);

    const toggleFilter = (type: string) => {
        setOpenFilter(openFilter === type ? null : type);
    };

    return (
        <div className="mb-10 flex flex-wrap items-center gap-4">
            {options.academicYear.length > 0 && (
                <FilterPill 
                    label="Academic Year" 
                    value={filters.academicYear} 
                    options={options.academicYear} 
                    icon={Calendar} 
                    isOpen={openFilter === 'year'}
                    onToggle={() => toggleFilter('year')}
                    onChange={(val: string) => { onFilterChange('academicYear', val); setOpenFilter(null); }}
                />
            )}
            {options.term.length > 0 && (
                <FilterPill 
                    label="Term" 
                    value={filters.term} 
                    options={options.term} 
                    icon={Clock} 
                    isOpen={openFilter === 'term'}
                    onToggle={() => toggleFilter('term')}
                    onChange={(val: string) => { onFilterChange('term', val); setOpenFilter(null); }}
                />
            )}
            {options.level.length > 0 && (
                <FilterPill 
                    label="Level" 
                    value={filters.level} 
                    options={options.level} 
                    icon={Layers} 
                    isOpen={openFilter === 'level'}
                    onToggle={() => toggleFilter('level')}
                    onChange={(val: string) => { onFilterChange('level', val); setOpenFilter(null); }}
                />
            )}
            {options.class.length > 0 && (
                <FilterPill 
                    label="Class" 
                    value={filters.class} 
                    options={options.class} 
                    icon={GraduationCap} 
                    isOpen={openFilter === 'class'}
                    onToggle={() => toggleFilter('class')}
                    onChange={(val: string) => { onFilterChange('class', val); setOpenFilter(null); }}
                />
            )}

            {/* Clear Filters Button Modernized */}
            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={onClearFilters}
                        className="flex h-12 items-center justify-center gap-2 rounded-2xl text-rose-500 bg-rose-500/10 px-6 hover:bg-rose-500 hover:text-white transition-all ml-auto text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/5 active:scale-95"
                    >
                        <FilterX size={16} />
                        Clear All
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

interface FilterPillProps {
    label: string;
    value: string;
    options: string[];
    icon: React.ElementType;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (val: string) => void;
}

function FilterPill({ label, value, options, icon: Icon, isOpen, onToggle, onChange }: FilterPillProps) {
    return (
        <div className="relative">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className={`flex h-12 items-center justify-between gap-3 rounded-2xl px-5 border transition-all duration-300 ${
                    value 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                }`}
            >
                <div className="flex items-center gap-2">
                    <Icon size={16} className={value ? 'text-white' : 'text-primary'} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {value || label}
                    </span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${value ? 'text-white/70' : 'text-slate-400'}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-3 p-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xl z-50 min-w-[200px]"
                    >
                        <div className="space-y-1">
                            {options.map((opt: string) => (
                                <button
                                    key={opt}
                                    onClick={() => onChange(opt)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        value === opt 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                            {value && (
                                <button
                                    onClick={() => onChange('')}
                                    className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all mt-1"
                                >
                                    Remove Filter
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
