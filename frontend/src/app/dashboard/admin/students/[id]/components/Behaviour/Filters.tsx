// app/components/Filters.tsx
'use client';

import { useState } from 'react';
import { FilterOption } from './types';

const filterOptions: FilterOption[] = [
  { label: 'All Events', value: 'all' },
  { label: 'Incidents', value: 'incidents' },
  { label: 'Notes', value: 'notes' },
  { label: 'Merits/Demerits', value: 'merits-demerits' }
];

const sortOptions: FilterOption[] = [
  { label: 'Sort by Newest', value: 'newest' },
  { label: 'Sort by Oldest', value: 'oldest' }
];

export default function Filters() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const handleFilterChange = (filterValue: string): void => {
    setActiveFilter(filterValue);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(event.target.value);
  };

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {filterOptions.map((filter: FilterOption) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeFilter === filter.value
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      <div className="relative">
        <select 
          value={sortBy}
          onChange={handleSortChange}
          className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {sortOptions.map((option: FilterOption) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
          <span className="material-symbols-outlined text-xl">expand_more</span>
        </div>
      </div>
    </div>
  );
}