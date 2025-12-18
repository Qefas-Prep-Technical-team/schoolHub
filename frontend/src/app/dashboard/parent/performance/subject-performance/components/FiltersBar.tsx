'use client';

import { useState } from 'react';
import { Search, Calendar, Filter, ChevronDown } from 'lucide-react';

interface FiltersBarProps {
    onSearch?: (query: string) => void;
    onFilterChange?: (filters: { term: string; assessmentType: string }) => void;
}

export default function FiltersBar({ onSearch, onFilterChange }: FiltersBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('Fall 2023');
    const [selectedAssessment, setSelectedAssessment] = useState('All Assessments');

    const terms = ['Fall 2023', 'Spring 2024', 'Summer 2024'];
    const assessments = ['All Assessments', 'Exams Only', 'Assignments Only', 'Quizzes Only'];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const handleTermChange = (term: string) => {
        setSelectedTerm(term);
        onFilterChange?.({ term, assessmentType: selectedAssessment });
    };

    const handleAssessmentChange = (assessment: string) => {
        setSelectedAssessment(assessment);
        onFilterChange?.({ term: selectedTerm, assessmentType: assessment });
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Term Selector */}
                <div className="relative">
                    <select
                        value={selectedTerm}
                        onChange={(e) => handleTermChange(e.target.value)}
                        className="appearance-none flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition-colors cursor-pointer pr-8"
                    >
                        {terms.map((term) => (
                            <option key={term} value={term}>
                                {term}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Assessment Type Selector */}
                <div className="relative">
                    <select
                        value={selectedAssessment}
                        onChange={(e) => handleAssessmentChange(e.target.value)}
                        className="appearance-none flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition-colors cursor-pointer pr-8"
                    >
                        {assessments.map((assessment) => (
                            <option key={assessment} value={assessment}>
                                {assessment}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search subject..."
                    className="w-full sm:w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
            </div>
        </div>
    );
}