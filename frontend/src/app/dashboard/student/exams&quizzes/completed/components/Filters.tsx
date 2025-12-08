'use client';

import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import Button from './ui/Button';
import { FilterOption } from './types';

interface FiltersProps {
    typeFilters: FilterOption[];
    subjectFilters: FilterOption[];
    scoreFilters: FilterOption[];
    onTypeChange?: (type: string) => void;
    onSubjectChange?: (subject: string) => void;
    onScoreChange?: (score: string) => void;
    onReset?: () => void;
}

export default function Filters({
    typeFilters,
    subjectFilters,
    scoreFilters,
    onTypeChange,
    onSubjectChange,
    onScoreChange,
    onReset,
}: FiltersProps) {
    const [selectedType, setSelectedType] = useState(typeFilters[0]);
    const [selectedSubject, setSelectedSubject] = useState(subjectFilters[0]);
    const [selectedScore, setSelectedScore] = useState(scoreFilters[0]);

    const handleTypeSelect = (filter: FilterOption) => {
        setSelectedType(filter);
        onTypeChange?.(filter.id);
    };

    const handleSubjectSelect = (filter: FilterOption) => {
        setSelectedSubject(filter);
        onSubjectChange?.(filter.id);
    };

    const handleScoreSelect = (filter: FilterOption) => {
        setSelectedScore(filter);
        onScoreChange?.(filter.id);
    };

    const handleReset = () => {
        setSelectedType(typeFilters[0]);
        setSelectedSubject(subjectFilters[0]);
        setSelectedScore(scoreFilters[0]);
        onReset?.();
    };

    return (
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-6 pt-6 dark:border-gray-700/60">
            {/* Type Filter */}
            <Button variant="secondary" icon={<ChevronDown className="h-4 w-4" />}>
                {selectedType.label}
            </Button>

            {/* Subject Filter */}
            <Button variant="secondary" icon={<ChevronDown className="h-4 w-4" />}>
                {selectedSubject.label}
            </Button>

            {/* Score Filter */}
            <Button variant="secondary" icon={<ChevronDown className="h-4 w-4" />}>
                {selectedScore.label}
            </Button>

            {/* Reset Button */}
            <Button
                variant="outline"
                onClick={handleReset}
                icon={<RotateCcw className="h-4 w-4" />}
                className="ml-auto"
            >
                Reset Filters
            </Button>
        </div>
    );
}