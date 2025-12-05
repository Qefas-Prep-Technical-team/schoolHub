'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export default function SearchInput({ 
  placeholder = 'Search...', 
  className = '',
  value: externalValue = '',
  onSearch,
  debounceMs = 300
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Sync with external value
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalValue(value);

    // Clear existing timer
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set new timer for debouncing
    if (onSearch) {
      const newTimerId = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
      setTimerId(newTimerId);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark pl-10 pr-4 text-sm text-text-light-primary dark:text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary focus:border-primary focus:ring-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
      />
    </div>
  );
}