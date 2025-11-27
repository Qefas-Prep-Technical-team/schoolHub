import { ReactNode } from 'react';

interface InputProps {
    type?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    startIcon?: ReactNode;
}

export default function Input({
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    startIcon
}: InputProps) {
    return (
        <div className="relative flex w-full flex-1 items-stretch">
            {startIcon && (
                <span className="flex items-center pl-3 text-gray-500 dark:text-gray-400 absolute left-0 top-0 h-full">
                    {startIcon}
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`form-input flex w-full min-w-0 flex-1 resize-none rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800 h-10 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm ${startIcon ? 'pl-10' : ''
                    } ${className}`}
            />
        </div>
    );
}