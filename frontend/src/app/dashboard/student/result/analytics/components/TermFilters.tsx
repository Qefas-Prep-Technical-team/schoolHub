'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TermFilter } from './types';
import Button from './ui/Button';

interface TermFiltersProps {
    terms: TermFilter[];
    onTermChange?: (term: TermFilter) => void;
}

export default function TermFilters({ terms, onTermChange }: TermFiltersProps) {
    const [selectedYear, setSelectedYear] = useState(terms[0]);
    const [selectedTerm, setSelectedTerm] = useState(terms.find(t => t.active) || terms[1]);

    const handleTermSelect = (term: TermFilter) => {
        setSelectedTerm(term);
        onTermChange?.(term);
    };

    return (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {/* Year Selector */}
            <Button variant="secondary" icon={<ChevronDown className="h-4 w-4" />}>
                {selectedYear.label}
            </Button>

            {/* Term Filters */}
            {terms.slice(1).map((term) => (
                <Button
                    key={term.id}
                    variant={term.active ? 'primary' : 'secondary'}
                    className={`${term.active ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300' : ''}`}
                    onClick={() => handleTermSelect(term)}
                >
                    {term.label}
                </Button>
            ))}
        </div>
    );
}