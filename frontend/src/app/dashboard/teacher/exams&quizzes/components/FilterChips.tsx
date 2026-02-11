import { ChevronDown, X } from 'lucide-react';

type FilterKeys = "class" | "subject" | "status" | "date";

interface FilterChipsProps {
  filters: {
    class: string;
    subject: string;
    status: string;
    date: string;
  };
  onFilterChange: (filterType: FilterKeys, value: string) => void;
  onClearFilters: () => void;
}

const filterOptions = {
  class: ['Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B', 'Grade 9C'],
  subject: ['Mathematics', 'Chemistry', 'Biology', 'Physics', 'English', 'History'],
  status: ['Published', 'Completed', 'Draft'],
  date: ['Last Week', 'Last Month', 'Last 3 Months', 'This Year'],
};

export default function FilterChips({ filters, onFilterChange, onClearFilters }: FilterChipsProps) {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="flex flex-wrap gap-3 py-6">
      {/* Class Filter */}
      <div className="relative group">
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          <span className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
            {filters.class || 'Filter by Class'}
          </span>
          <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
        <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
          {filterOptions.class.map((className) => (
            <button
              key={className}
              onClick={() => onFilterChange('class', className)}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                filters.class === className ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {className}
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
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          <span className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
            {filters.subject || 'Filter by Subject'}
          </span>
          <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
        <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
          {filterOptions.subject.map((subject) => (
            <button
              key={subject}
              onClick={() => onFilterChange('subject', subject)}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                filters.subject === subject ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
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

      {/* Status Filter */}
      <div className="relative group">
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          <span className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
            {filters.status || 'Filter by Status'}
          </span>
          <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
        <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
          {filterOptions.status.map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange('status', status.toLowerCase())}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                filters.status === status.toLowerCase() ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
          {filters.status && (
            <button
              onClick={() => onFilterChange('status', '')}
              className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Date Filter */}
      <div className="relative group">
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          <span className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
            {filters.date || 'Filter by Date'}
          </span>
          <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
        <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
          {filterOptions.date.map((date) => (
            <button
              key={date}
              onClick={() => onFilterChange('date', date)}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                filters.date === date ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {date}
            </button>
          ))}
          {filters.date && (
            <button
              onClick={() => onFilterChange('date', '')}
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
          className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark px-4 hover:text-text-light dark:hover:text-text-dark transition-colors ml-auto"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium leading-normal">Clear Filters</span>
        </button>
      )}
    </div>
  );
}