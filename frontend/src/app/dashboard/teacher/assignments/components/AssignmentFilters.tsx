'use client';

import { useState } from 'react';
import SearchBar from './SearchBar';


interface FilterOption {
    value: string;
    label: string;
}

interface AssignmentFiltersProps {
    onSearch?: (query: string) => void;
    onFilterChange?: (filters: { status: string; subject: string }) => void;
    onViewChange?: (view: 'list' | 'grid') => void;
}

export default function AssignmentFilters({
    onSearch,
    onFilterChange,
    onViewChange
}: AssignmentFiltersProps) {
    const [filters, setFilters] = useState({ status: '', subject: '' });
    const [view, setView] = useState<'list' | 'grid'>('grid');

    const statusOptions: FilterOption[] = [
        { value: '', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'due-soon', label: 'Due Soon' },
        { value: 'draft', label: 'Draft' },
    ];

    const subjectOptions: FilterOption[] = [
        { value: '', label: 'All Subjects' },
        { value: 'biology', label: 'Biology' },
        { value: 'history', label: 'History' },
        { value: 'mathematics', label: 'Mathematics' },
        { value: 'physics', label: 'Physics' },
    ];

    const handleFilterChange = (type: 'status' | 'subject', value: string) => {
        const newFilters = { ...filters, [type]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleViewChange = (newView: 'list' | 'grid') => {
        setView(newView);
        onViewChange?.(newView);
    };

    return (
        <div className="bg-white dark:bg-[#1A232E] rounded-xl p-4 border border-[#E5E7EB] dark:border-[#374151] mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <SearchBar onSearch={onSearch} />

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="flex h-12 w-full items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4 border border-[#E5E7EB] dark:border-[#374151] hover:bg-primary/5 dark:hover:bg-primary/10 text-[#0e121b] dark:text-white text-sm font-medium leading-normal appearance-none cursor-pointer"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Subject Filter */}
                    <select
                        value={filters.subject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                        className="flex h-12 w-full items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4 border border-[#E5E7EB] dark:border-[#374151] hover:bg-primary/5 dark:hover:bg-primary/10 text-[#0e121b] dark:text-white text-sm font-medium leading-normal appearance-none cursor-pointer"
                    >
                        {subjectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* View Toggle */}
                <div className="flex h-12 items-center justify-center rounded-lg bg-background-light dark:bg-background-dark p-1 border border-[#E5E7EB] dark:border-[#374151]">
                    <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-[#374151] has-[:checked]:shadow-sm has-[:checked]:text-primary text-[#506795] dark:text-[#9CA3AF] text-sm font-medium leading-normal transition-all">
                        <span className="material-symbols-outlined">list</span>
                        <span className="truncate hidden sm:inline">List View</span>
                        <input
                            type="radio"
                            name="view-toggle"
                            value="list"
                            checked={view === 'list'}
                            onChange={() => handleViewChange('list')}
                            className="invisible w-0"
                        />
                    </label>
                    <label className="flex cursor-pointer h-full grow items-center justify-center gap-2 overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-[#374151] has-[:checked]:shadow-sm has-[:checked]:text-primary text-[#506795] dark:text-[#9CA3AF] text-sm font-medium leading-normal transition-all">
                        <span className="material-symbols-outlined">grid_view</span>
                        <span className="truncate hidden sm:inline">Card View</span>
                        <input
                            type="radio"
                            name="view-toggle"
                            value="grid"
                            checked={view === 'grid'}
                            onChange={() => handleViewChange('grid')}
                            className="invisible w-0"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}