'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = "Search by parent or student name..."
}) => {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="px-0 py-3">
            <label className="flex flex-col min-w-40 h-14 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                    <div className="text-slate-400 dark:text-slate-500 flex bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-opacity-50 border-none bg-white dark:bg-slate-800 h-full placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                        placeholder={placeholder}
                        value={query}
                        onChange={handleChange}
                    />
                </div>
            </label>
        </div>
    );
};

export default SearchBar;