'use client';

import { TimeFilterOption } from './types';
import { cn } from '@/lib/utils';

interface TimeFilterProps {
    filters: TimeFilterOption[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
    title?: string;
}

export default function TimeFilter({ filters, activeFilter, onFilterChange }: TimeFilterProps) {
    return (
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shrink-0">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    type="button"
                    className={cn(
                        "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                        activeFilter === filter.id
                            ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                    )}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
