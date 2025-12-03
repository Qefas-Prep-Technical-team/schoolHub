/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Button from '../../components/ui/Button';
import SearchBar from './ui/SearchBar';


interface GradingToolbarProps {
  onSearch?: (query: string) => void;
  onSaveAll?: () => void;
  onExportGrades?: () => void;
  onFilterChange?: (filter: 'all' | 'graded' | 'ungraded' | 'late' | 'missing') => void;
  isLoading?: boolean;
}

export default function GradingToolbar({ 
  onSearch, 
  onSaveAll, 
  onExportGrades,
  onFilterChange,
  isLoading = false 
}: GradingToolbarProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'graded' | 'ungraded' | 'late' | 'missing'>('all');

  const handleFilterClick = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  const filters = [
    { key: 'all', label: 'All Students', count: null },
    { key: 'graded', label: 'Graded', count: null },
    { key: 'ungraded', label: 'Ungraded', count: null },
    { key: 'late', label: 'Late', count: null },
    { key: 'missing', label: 'Missing', count: null },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 dark:border-slate-800">
      {/* Search */}
      <div className="w-full max-w-xs">
        <SearchBar
          placeholder="Search student..."
          onSearch={onSearch}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleFilterClick(filter.key as any)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {filter.label}
            {filter.count !== null && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          icon="download"
          onClick={onExportGrades}
          disabled={isLoading}
        >
          Export Grades
        </Button>
        
        <Button
          icon="save"
          onClick={onSaveAll}
          loading={isLoading}
        >
          Save All Grades
        </Button>
      </div>
    </div>
  );
}