'use client';

import { useState, useEffect } from 'react';
import { ChartArea, ChevronDown, Filter } from 'lucide-react';
import Button from './ui/Button';
import SearchInput from './ui/SearchInput';
import { FilterOption } from './types';
import Link from 'next/link';

interface FiltersProps {
  termOptions: FilterOption[];
  examTypeOptions: FilterOption[];
  subjectOptions: FilterOption[];
  initialSearch?: string;
}

export default function Filters({
  termOptions,
  examTypeOptions,
  subjectOptions,
  initialSearch = '',
}: FiltersProps) {
  const [selectedTerm, setSelectedTerm] = useState(termOptions[0]);
  const [selectedExamType, setSelectedExamType] = useState(examTypeOptions[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjectOptions[0]);
  const [searchValue, setSearchValue] = useState(initialSearch);

  // You can add URL state management here if needed
  const updateURLParams = () => {
    const params = new URLSearchParams();
    params.set('term', selectedTerm.value);
    params.set('examType', selectedExamType.value);
    params.set('subject', selectedSubject.value);
    if (searchValue) {
      params.set('search', searchValue);
    }
    // Update browser URL without reloading
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // You can add debouncing here if needed
    console.log('Searching for:', value);
  };

  // Update URL when filters change
  useEffect(() => {
    updateURLParams();
  }, [selectedTerm, selectedExamType, selectedSubject, searchValue]);

  return (
    <div className="mb-6 mt-8 flex flex-wrap items-center gap-3">
      {/* Term Filter */}
      <div className="relative">
        <Button
          variant="outline"
          icon={<Filter className="h-4 w-4" />}
          className="shrink-0"
        >
          Term: {selectedTerm.label}
          <ChevronDown className="h-4 w-4 text-text-light-secondary dark:text-dark-secondary" />
        </Button>
      </div>

      {/* Exam Type Filter */}
      <div className="relative">
        <Button variant="outline" className="shrink-0">
          Exam Type: {selectedExamType.label}
          <ChevronDown className="h-4 w-4 text-text-light-secondary dark:text-dark-secondary" />
        </Button>
      </div>

      {/* Subject Filter */}
      <div className="relative">
        <Button variant="outline" className="shrink-0">
          Subject: {selectedSubject.label}
          <ChevronDown className="h-4 w-4 text-text-light-secondary dark:text-dark-secondary" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex-grow sm:flex-grow-0 sm:min-w-64">
        <SearchInput
          placeholder="Search subjects..."
          value={searchValue}
          onSearch={handleSearch}
        />
      </div>
      <div className="relative">
        <Link href={"/dashboard/student/result/analytics"}>

          <Button variant="outline" className="shrink-0 cursor-pointer">
            Analytics
            <ChartArea />
          </Button>
        </Link>
      </div>
    </div>
  );
}