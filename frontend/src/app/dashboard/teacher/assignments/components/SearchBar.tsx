'use client';

import { useState } from 'react';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    className?: string;
}

export default function SearchBar({
    placeholder = 'Search by title, subject, or class...',
    onSearch,
    className = ''
}: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
    };

    return (
        <div className={`lg:col-span-2 ${className}`}>
            <form onSubmit={handleSubmit}>
                <label className="flex flex-col w-full h-12">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                        <div className="text-[#506795] dark:text-[#9CA3AF] flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border border-r-0 border-[#E5E7EB] dark:border-[#374151]">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 bg-background-light dark:bg-background-dark h-full placeholder:text-[#506795] dark:placeholder:text-[#9CA3AF] px-4 rounded-l-none border border-l-0 border-[#E5E7EB] dark:border-[#374151] pl-2 text-base font-normal leading-normal"
                        />
                    </div>
                </label>
            </form>
        </div>
    );
}