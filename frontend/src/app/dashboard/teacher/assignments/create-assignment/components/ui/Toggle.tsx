'use client';

import { InputHTMLAttributes } from 'react';

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
}

export default function Toggle({
    label,
    description,
    checked,
    onChange,
    ...props
}: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                {label && (
                    <p className="text-[#0e121b] dark:text-white text-base font-medium leading-normal">
                        {label}
                    </p>
                )}
                {description && (
                    <p className="text-sm text-[#506795] dark:text-[#A1A1AA]">
                        {description}
                    </p>
                )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={onChange}
                    {...props}
                />
                <div className="w-11 h-6 bg-[#E4E4E7] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary rounded-full peer dark:bg-[#374151] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
        </div>
    );
}