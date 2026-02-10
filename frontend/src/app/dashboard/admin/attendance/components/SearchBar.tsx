'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export default function SearchBar({
    placeholder = 'Search...',
    value: controlledValue,
    onChange,
    className,
}: SearchBarProps) {
    const [internalValue, setInternalValue] = useState('');

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (controlledValue !== undefined) {
            onChange?.(newValue);
        } else {
            setInternalValue(newValue);
            onChange?.(newValue);
        }
    };

    return (
        <div className={`hidden md:flex flex-col min-w-40 h-10 max-w-64 ${className}`}>
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                <div className="text-text-secondary-light dark:text-text-secondary-dark flex border-none bg-background-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <Search className="h-5 w-5" />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-primary-light dark:text-text-primary-dark focus:outline-0 focus:ring-0 border-none bg-background-light dark:bg-surface-dark focus:border-none h-full placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                />
            </div>
        </div>
    );
}