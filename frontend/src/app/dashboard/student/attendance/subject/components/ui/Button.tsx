// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    className?: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    onClick,
}) => {
    const baseClasses = 'flex items-center justify-center gap-2 rounded-lg shadow-sm hover:transition-colors';

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm font-medium',
        md: 'h-10 px-4 text-sm font-medium',
        lg: 'h-12 px-6 text-base font-medium',
    };

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/80',
        secondary: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;