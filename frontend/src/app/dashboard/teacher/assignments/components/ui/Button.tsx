'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    loading?: boolean;
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'flex items-center justify-center overflow-hidden rounded-lg font-bold leading-normal tracking-[0.015em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-primary/20 text-primary hover:bg-primary/30',
        outline: 'border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1A232E] hover:bg-primary/10 dark:hover:bg-primary/20',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Loading...
                </span>
            ) : (
                <>
                    {icon && (
                        <span className="material-symbols-outlined mr-2" style={{ fontSize: '20px' }}>
                            {icon}
                        </span>
                    )}
                    <span className="truncate">{children}</span>
                </>
            )}
        </button>
    );
}