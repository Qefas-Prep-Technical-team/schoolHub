'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export default function Input({
    label,
    error,
    fullWidth = false,
    className = '',
    ...props
}: InputProps) {
    return (
        <label className={`flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
            {label && (
                <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal pb-2">
                    {label}
                </p>
            )}
            <input
                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[#d1d8e6] dark:border-[#374151] focus:border-primary'
                    } bg-[#f6f6f8] dark:bg-[#111721] h-12 placeholder:text-[#506795] p-3 text-base font-normal leading-normal ${className}`}
                {...props}
            />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </label>
    );
}