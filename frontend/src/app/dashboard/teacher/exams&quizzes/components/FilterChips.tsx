import { ChevronDown, X } from 'lucide-react';

type FilterKeys = "class" | "subject" | "status" | "date";

interface FilterChipsProps {
  filters: {
    class: string;
    subject: string;
    status: string;
    date: string;
  };
  classes?: { id: string; name: string }[];
  subjects?: { id: string; name: string }[];
  onFilterChange: (filterType: FilterKeys, value: string) => void;
  onClearFilters: () => void;
}

const filterOptions = {
  status: ['Published', 'Completed', 'Draft'],
  date: ['Last Week', 'Last Month', 'Last 3 Months', 'This Year'],
};

export default function FilterChips({ filters, classes = [], subjects = [], onFilterChange, onClearFilters }: FilterChipsProps) {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const selectedClass = classes.find(c => c.id === filters.class);
  const selectedClassName = selectedClass ? selectedClass.name : (filters.class ? filters.class : 'Filter by Class');

  const selectedSubject = subjects.find(s => s.id === filters.subject);
  const selectedSubjectName = selectedSubject ? selectedSubject.name : (filters.subject ? filters.subject : 'Filter by Subject');

  return (
    <div className="flex flex-wrap gap-3 py-6">
      {/* Class Filter */}
      <div className="relative group">
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
          <span className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
            {selectedClassName}
          </span>
          <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
        <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
          {classes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">No classes assigned</div>
          ) : (
            classes.map((c) => (
              <button
                key={c.id}
                onClick={() => onFilterChange('class', c.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  filters.class === c.id ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {c.name}
              </button>
            ))
          )}
          {filters.class && (
            <button
              onClick={() => onFilterChange('class', '')}
              className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
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
            {selectedSubjectName}
          </span>
          <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
        <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-1 p-2 min-w-[160px] z-10 border border-gray-200 dark:border-gray-700">
          {subjects.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">No subjects assigned</div>
          ) : (
            subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onFilterChange('subject', sub.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  filters.subject === sub.id ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {sub.name}
              </button>
            ))
          )}
          {filters.subject && (
            <button
              onClick={() => onFilterChange('subject', '')}
              className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
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
            {filters.status ? (filters.status.charAt(0).toUpperCase() + filters.status.slice(1)) : 'Filter by Status'}
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
              className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
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
              className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
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
