'use client';

import { FilterOption } from './types';
import { useState } from 'react';

interface FilterTabsProps {
    filters: FilterOption[];
    onFilterChange?: (filter: FilterOption['value']) => void;
}

export default function FilterTabs({ filters, onFilterChange }: FilterTabsProps) {
    const [selectedFilter, setSelectedFilter] = useState<FilterOption['value']>('all');

    const handleFilterChange = (value: FilterOption['value']) => {
        setSelectedFilter(value);
        onFilterChange?.(value);
    };

    return (
        <div className="flex py-6">
            <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-200/80 p-1 dark:bg-background-dark/50">
                {filters.map((filter) => (
                    <label
                        key={filter.value}
                        className="flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal text-[#505095] transition-all has-[:checked]:bg-white has-[:checked]:text-primary has-[:checked]:shadow-sm dark:text-gray-400 dark:has-[:checked]:bg-gray-700 dark:has-[:checked]:text-white"
                    >
                        <input
                            type="radio"
                            name="filter"
                            value={filter.value}
                            checked={selectedFilter === filter.value}
                            onChange={() => handleFilterChange(filter.value)}
                            className="invisible w-0"
                        />
                        <span className="truncate">{filter.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}