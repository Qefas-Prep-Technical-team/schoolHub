// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: string;
    className?: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    icon,
    className = '',
    onClick,
}) => {
    const baseClasses = 'flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-wide shadow-sm hover:transition-colors';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
        outline: 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="material-symbols-outlined text-xl">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;