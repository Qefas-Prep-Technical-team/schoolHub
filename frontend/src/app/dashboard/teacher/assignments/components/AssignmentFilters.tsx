'use client';

import { useState } from 'react';
import SearchBar from './SearchBar';
import { motion } from 'framer-motion';
import { LayoutGrid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';

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
        <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 w-full">
                <SearchBar onSearch={onSearch} />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                {/* Custom Select Wrapper */}
                <div className="relative group w-full sm:w-44">
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full h-12 pl-4 pr-10 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all outline-none group-hover:bg-white dark:group-hover:bg-slate-800"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                </div>

                <div className="relative group w-full sm:w-44">
                    <select
                        value={filters.subject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                        className="w-full h-12 pl-4 pr-10 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all outline-none group-hover:bg-white dark:group-hover:bg-slate-800"
                    >
                        {subjectOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                </div>

                {/* View Toggle Controls */}
                <div className="flex p-1 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl gap-1">
                    <ViewButton 
                        active={view === 'list'} 
                        onClick={() => handleViewChange('list')} 
                        icon={List} 
                        label="List"
                    />
                    <ViewButton 
                        active={view === 'grid'} 
                        onClick={() => handleViewChange('grid')} 
                        icon={LayoutGrid} 
                        label="Grid"
                    />
                </div>
            </div>
        </div>
    );
}

function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                active 
                    ? 'text-primary' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
        >
            <Icon size={16} className="relative z-10" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-black uppercase tracking-widest relative z-10 hidden sm:inline">{label}</span>
            {active && (
                <motion.div
                    layoutId="view-toggle-bg"
                    className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </button>
    );
}