// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    onClick,
    disabled = false,
    type = 'button'
}) => {
    const baseClasses = 'flex cursor-pointer items-center justify-center overflow-hidden rounded-lg font-bold leading-normal tracking-wide hover:transition-colors disabled:cursor-not-allowed disabled:opacity-50';

    const sizeClasses = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    const variantClasses = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white',
        secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700',
        outline: 'bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    };

    return (
        <button
            type={type}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;