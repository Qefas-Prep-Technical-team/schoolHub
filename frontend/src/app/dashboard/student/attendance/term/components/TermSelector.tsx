// src/components/Dashboard/TermSelector.tsx
import React from 'react';
import { TermOption } from './types';

const TermSelector: React.FC = () => {
    const termOptions: TermOption[] = [
        { label: 'Term 1', value: 'Term 1' },
        { label: 'Term 2', value: 'Term 2', defaultChecked: true },
        { label: 'Term 3', value: 'Term 3' },
    ];

    return (
        <div className="mb-6">
            <div className="flex h-12 w-full max-w-md items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800 p-1">
                {termOptions.map((option) => (
                    <label
                        key={option.value}
                        className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-md has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-medium transition-all duration-300"
                    >
                        <span className="truncate">{option.label}</span>
                        <input
                            className="sr-only"
                            name="term-selector"
                            type="radio"
                            value={option.value}
                            defaultChecked={option.defaultChecked}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};

export default TermSelector;