// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
}) => {
    const baseClasses = 'flex cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-sm';

    const sizeClasses = {
        sm: 'h-8 px-4 text-sm font-medium leading-normal',
        md: 'h-10 px-4 text-sm font-medium leading-normal',
        lg: 'h-11 px-5 text-sm font-bold leading-normal tracking-wide',
    };

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
        outline: 'bg-transparent border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
        >
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;