'use client';

import { useState } from 'react';
import { Mail, School } from 'lucide-react';
import TopHeader from './components/TopHeader';
import StatsOverview from './components/StatsOverview';
import FiltersBar from './components/FiltersBar';
import SubjectGrid from './components/SubjectGrid';

export default function PerformancePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        term: 'Fall 2023',
        assessmentType: 'All Assessments',
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters: { term: string; assessmentType: string }) => {
        setFilters(newFilters);
    };

    return (
        <div className="flex  ">
            {/* Main Content */}
            <main className="flex-1 flex flex-col  relative overflow-y-auto bg-background-light dark:bg-background-dark">
                <TopHeader
                    title="Performance Breakdown"
                    studentName="Alex Johnson"
                    grade="Grade 10"
                />

                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                Subject Performance
                            </h1>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <School className="h-5 w-5" />
                                <span className="text-base font-normal">
                                    Academic breakdown for{' '}
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        Alex Johnson (Grade 10)
                                    </span>
                                </span>
                            </div>
                        </div>

                        <button className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white h-10 px-6 text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-colors">
                            <Mail className="h-4 w-4" />
                            <span>Contact Teacher</span>
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <StatsOverview />

                    {/* Filters & Search */}
                    <FiltersBar
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Subject Grid */}
                    <SubjectGrid
                        searchQuery={searchQuery}
                        filters={filters}
                    />
                </div>
            </main>
        </div>
    );
}