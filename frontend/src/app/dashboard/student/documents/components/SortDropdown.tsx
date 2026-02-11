'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SortOption } from './types';

interface SortDropdownProps {
  options: SortOption[];
  selectedOption: string;
  onSortChange: (value: string) => void;
  className?: string;
}

export default function SortDropdown({ 
  options, 
  selectedOption, 
  onSortChange,
  className = "" 
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find(opt => opt.value === selectedOption)?.label || 'Sort by';

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span>Sort by: {selectedLabel}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === option.value
                    ? 'text-primary bg-primary/5 dark:bg-primary/10'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}