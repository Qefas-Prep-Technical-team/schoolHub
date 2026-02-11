import { ChevronDown, X } from 'lucide-react';

interface FilterChipsProps {
    filters: {
        academicYear: string;
        term: string;
        level: string;
        class: string;
        subject: string;
    };
    onFilterChange: (filterType: keyof typeof filters, value: string) => void;
    onClearFilters: () => void;
}

const filterOptions = {
    academicYear: ['2023-2024', '2024-2025', '2025-2026'],
    term: ['Term 1', 'Term 2', 'Term 3'],
    level: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'],
    class: ['JSS 1A', 'JSS 1B', 'JSS 2A', 'JSS 2B', 'SSS 1A', 'SSS 1B', 'SSS 1C'],
    subject: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Basic Science', 'Social Studies'],
};

export default function FilterChips({ filters, onFilterChange, onClearFilters }: FilterChipsProps) {
    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Academic Year Filter */}
            <div className="relative group">
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {filters.academicYear || 'Academic Year'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
                    {filterOptions.academicYear.map((year) => (
                        <button
                            key={year}
                            onClick={() => onFilterChange('academicYear', year)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters.academicYear === year ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                    {filters.academicYear && (
                        <button
                            onClick={() => onFilterChange('academicYear', '')}
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Term Filter */}
            <div className="relative group">
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {filters.term || 'Term'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
                    {filterOptions.term.map((term) => (
                        <button
                            key={term}
                            onClick={() => onFilterChange('term', term)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters.term === term ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {term}
                        </button>
                    ))}
                    {filters.term && (
                        <button
                            onClick={() => onFilterChange('term', '')}
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Level Filter */}
            <div className="relative group">
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {filters.level || 'Level'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
                    {filterOptions.level.map((level) => (
                        <button
                            key={level}
                            onClick={() => onFilterChange('level', level)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters.level === level ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                    {filters.level && (
                        <button
                            onClick={() => onFilterChange('level', '')}
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Class Filter */}
            <div className="relative group">
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {filters.class || 'Class'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
                    {filterOptions.class.map((cls) => (
                        <button
                            key={cls}
                            onClick={() => onFilterChange('class', cls)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters.class === cls ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {cls}
                        </button>
                    ))}
                    {filters.class && (
                        <button
                            onClick={() => onFilterChange('class', '')}
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Subject Filter */}
            <div className="relative group">
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {filters.subject || 'Subject'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
                    {filterOptions.subject.map((subject) => (
                        <button
                            key={subject}
                            onClick={() => onFilterChange('subject', subject)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters.subject === subject ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                    {filters.subject && (
                        <button
                            onClick={() => onFilterChange('subject', '')}
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <button
                    onClick={onClearFilters}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg text-gray-600 dark:text-gray-400 px-4 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ml-auto"
                >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Clear All</span>
                </button>
            )}
        </div>
    );
}