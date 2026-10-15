'use client';

import { useState } from 'react';
import SearchBar from './SearchBar';
import { motion } from 'framer-motion';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface AssignmentFiltersProps {
    onSearch?: (query: string) => void;
    onFilterChange?: (filters: { status: string; subject: string; classId: string }) => void;
    onViewChange?: (view: 'list' | 'grid') => void;
    subjectOptions?: FilterOption[];
    classOptions?: FilterOption[];
    currentView?: 'list' | 'grid';
}

export default function AssignmentFilters({
    onSearch,
    onFilterChange,
    onViewChange,
    subjectOptions,
    classOptions,
    currentView = 'grid'
}: AssignmentFiltersProps) {
    const [filters, setFilters] = useState({ status: '', subject: '', classId: '' });

    const statusOptions: FilterOption[] = [
        { value: '', label: 'All Statuses' },
        { value: 'published', label: 'Published' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'due-soon', label: 'Due Soon' },
        { value: 'draft', label: 'Draft' },
    ];

    const defaultSubjectOptions: FilterOption[] = [
        { value: '', label: 'All Subjects' },
        { value: 'biology', label: 'Biology' },
        { value: 'history', label: 'History' },
        { value: 'mathematics', label: 'Mathematics' },
        { value: 'physics', label: 'Physics' },
    ];

    const currentSubjectOptions = subjectOptions || defaultSubjectOptions;

    const handleFilterChange = (type: 'status' | 'subject' | 'classId', value: string) => {
        const newFilters = { ...filters, [type]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    return (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
            <div className="flex-1 w-full">
                <SearchBar onSearch={onSearch} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Status Dropdown */}
                <div className="relative group w-full lg:w-40">
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full h-11 pl-3.5 pr-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none shadow-sm"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                </div>

                {/* Subject Dropdown */}
                <div className="relative group w-full lg:w-40">
                    <select
                        value={filters.subject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                        className="w-full h-11 pl-3.5 pr-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none shadow-sm"
                    >
                        {currentSubjectOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                </div>

                {/* Class Dropdown */}
                {classOptions && classOptions.length > 1 && (
                    <div className="relative group w-full lg:w-40">
                        <select
                            value={filters.classId}
                            onChange={(e) => handleFilterChange('classId', e.target.value)}
                            className="w-full h-11 pl-3.5 pr-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none shadow-sm"
                        >
                            {classOptions.map((option) => (
                                <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                )}

                {/* View Toggle Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-11 border border-slate-200/60 dark:border-slate-800 shadow-inner col-span-1 sm:col-span-3 lg:col-span-1 justify-center sm:justify-start">
                    <button
                        type="button"
                        onClick={() => onViewChange?.('grid')}
                        className={`flex-1 sm:flex-none h-full px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            currentView === 'grid' 
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-black' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <LayoutGrid size={14} strokeWidth={2.5} />
                        <span>Grid</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewChange?.('list')}
                        className={`flex-1 sm:flex-none h-full px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            currentView === 'list' 
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-black' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <List size={14} strokeWidth={2.5} />
                        <span>List</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
