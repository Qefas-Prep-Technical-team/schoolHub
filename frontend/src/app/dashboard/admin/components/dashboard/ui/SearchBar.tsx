'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  placeholder = 'Search...',
  className,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className={cn(
      'flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg h-10 px-3',
      'border border-transparent transition-all',
      isFocused ? 'border-primary/50 ring-2 ring-primary/20' : '',
      className
    )}>
      <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 ml-2 outline-none"
      />
      {query && (
        <button
          onClick={handleClear}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
        >
          <X className="h-3 w-3 text-slate-400" />
        </button>
      )}
    </div>
  );
}