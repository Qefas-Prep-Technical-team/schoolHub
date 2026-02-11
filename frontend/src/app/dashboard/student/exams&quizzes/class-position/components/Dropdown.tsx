// src/components/UI/Dropdown.tsx (simplified)
import React from 'react';

interface DropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange }) => {
    return (
        <select
            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1C2431] border border-gray-200 dark:border-gray-700 px-4 text-sm font-medium leading-normal text-[#0e121b] dark:text-gray-300"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>
                {label}
            </option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};

export default Dropdown;