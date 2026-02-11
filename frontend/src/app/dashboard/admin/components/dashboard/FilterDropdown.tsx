'use client';

import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function FilterDropdown({
  options,
  value,
  onChange,
  placeholder = 'Filter',
  icon: Icon = Filter,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800',
          'hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2',
          'text-sm font-medium text-slate-900 dark:text-white transition-colors',
          className
        )}
      >
        <Icon className="h-4 w-4 text-slate-500" />
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown className={cn(
          'h-4 w-4 text-slate-500 transition-transform',
          isOpen ? 'rotate-180' : ''
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700',
                'transition-colors',
                option.value === value
                  ? 'text-primary font-semibold bg-slate-50 dark:bg-slate-700/50'
                  : 'text-slate-700 dark:text-slate-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}