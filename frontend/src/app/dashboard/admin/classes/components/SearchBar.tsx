'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  delay?: number; // Debounce delay in ms
  className?: string;
}

export default function SearchBar({
  placeholder = "Search by class, teacher, grade...",
  onSearch,
  delay = 300,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for debouncing
    const newTimeoutId = setTimeout(() => {
      onSearch(value);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    onSearch(query);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div className="flex w-full flex-1 items-stretch rounded-xl h-12">
          <div className="flex items-center justify-center pl-4 rounded-l-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 border-r-0">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="flex w-full min-w-0 flex-1 rounded-r-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary/50 px-4 text-sm"
          />
        </div>
      </form>
    </div>
  );
}