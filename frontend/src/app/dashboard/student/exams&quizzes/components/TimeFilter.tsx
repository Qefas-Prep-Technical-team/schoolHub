'use client';

import { TimeFilterOption } from './types';

interface TimeFilterProps {
    filters: TimeFilterOption[];
    activeFilter: string;
    onFilterChange: (filterId: string) => void;
    title?: string;
}

export default function TimeFilter({
    filters,
    activeFilter,
    onFilterChange,
    title = 'Upcoming Exams'
}: TimeFilterProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 mt-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <div className="flex items-center gap-2 rounded-lg bg-slate-200/50 p-1 text-sm dark:bg-slate-800/50">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-3 py-1 rounded-md transition-colors ${activeFilter === filter.id
                            ? 'bg-white dark:bg-slate-900 shadow-sm text-primary font-semibold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}