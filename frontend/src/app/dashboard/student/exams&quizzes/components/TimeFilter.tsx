'use client';

import { TimeFilterOption } from './types';
import { CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeFilterProps {
    filters: TimeFilterOption[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
    title?: string;
}

export default function TimeFilter({ filters, activeFilter, onFilterChange, title }: TimeFilterProps) {
    return (
        <div className="mt-12 mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    <CalendarRange size={14} />
                    <span>Timeline</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {title || 'Current Assessments'}
                </h2>
            </div>

            <div className="flex gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300",
                            activeFilter === filter.id
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}