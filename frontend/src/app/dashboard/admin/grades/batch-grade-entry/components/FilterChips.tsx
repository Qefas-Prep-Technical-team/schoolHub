import { ChevronDown } from 'lucide-react';
import Chip from './ui/Chip';

interface FilterOption {
    label: string;
    value: string;
    options?: string[];
}

interface FilterChipsProps {
    filters: FilterOption[];
    onFilterChange?: (filter: FilterOption, value: string) => void;
}

export default function FilterChips({ filters, onFilterChange }: FilterChipsProps) {
    return (
        <div className="flex flex-wrap gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            {filters.map((filter, index) => (
                <Chip
                    key={index}
                    label={filter.label}
                    value={filter.value}
                    options={filter.options}
                    onChange={(value) => onFilterChange?.(filter, value)}
                />
            ))}
        </div>
    );
}