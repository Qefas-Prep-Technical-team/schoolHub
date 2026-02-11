// src/components/Dashboard/FilterChips.tsx
import React from 'react';
import { FilterOption } from './types';
import Chip from './ui/Chip';

const FilterChips: React.FC = () => {
    const filterOptions: FilterOption[] = [
        {
            label: 'Filter: Term 1',
            value: 'term-1',
            icon: 'filter_list'
        },
        {
            label: 'Filter: Class 10B',
            value: 'class-10b',
            icon: 'filter_list'
        }
    ];

    return (
        <div className="flex flex-wrap gap-3 mb-6">
            {filterOptions.map((option) => (
                <Chip key={option.value} {...option} />
            ))}
        </div>
    );
};

export default FilterChips;