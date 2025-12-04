'use client';

interface FilterButton {
    key: string;
    label: string;
    count?: number;
}

interface FilterButtonsProps {
    filters: FilterButton[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    className?: string;
}

export default function FilterButtons({
    filters,
    activeFilter,
    onFilterChange,
    className = ''
}: FilterButtonsProps) {
    return (
        <div className={`flex flex-wrap items-center gap-2 border border-slate-200 dark:border-white/10 rounded-lg p-1 ${className}`}>
            {filters.map((filter) => (
                <button
                    key={filter.key}
                    onClick={() => onFilterChange(filter.key)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeFilter === filter.key
                            ? 'bg-primary text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                >
                    {filter.label}
                    {filter.count !== undefined && (
                        <span className="ml-1.5 text-xs opacity-80">
                            ({filter.count})
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}