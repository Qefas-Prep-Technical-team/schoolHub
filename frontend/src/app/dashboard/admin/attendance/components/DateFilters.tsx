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
                    className={`flex h-9 shrink-0 items-center justify-center px-4 rounded-xl text-sm font-medium transition-colors ${selectedFilter === filter.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary'
                        }`}
                >
                    {filter.label}
                </button>
            ))}

            <button
                onClick={() => console.log('Open date picker')}
                className="flex h-9 shrink-0 items-center justify-center px-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors ml-auto"
            >
                <CalendarRange className="mr-1 h-4 w-4" />
                Custom Range
            </button>
        </div>
    );
}