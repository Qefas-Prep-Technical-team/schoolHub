import { ReactNode } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    id?: string;
}

export default function Select({
    options,
    value,
    onChange,
    className = '',
    id
}: SelectProps) {
    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={`form-select w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:border-primary focus:ring-primary/50 text-sm ${className}`}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}