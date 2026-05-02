'use client';

import { CalendarRange } from 'lucide-react';
import { useState } from 'react';

interface DateFilter {
    id: string;
    label: string;
    value: string;
}

export default function DateFilters() {
    const [selectedFilter, setSelectedFilter] = useState('today');

    const filters: DateFilter[] = [
        { id: 'today', label: 'Today', value: 'today' },
        { id: 'yesterday', label: 'Yesterday', value: 'yesterday' },
        { id: 'last7', label: 'Last 7 Days', value: 'last7' },
    ];

    return (
        <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex h-11 shrink-0 items-center justify-center px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFilter === filter.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/30'
                        }`}
                >
                    {filter.label}
                </button>
            ))}

            <button
                onClick={() => console.log('Open date picker')}
                className="flex h-11 shrink-0 items-center justify-center px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/30 text-[10px] font-black uppercase tracking-widest transition-all ml-auto"
            >
                <CalendarRange className="mr-2 h-4 w-4" />
                Custom Range
            </button>
        </div>
    );
}

