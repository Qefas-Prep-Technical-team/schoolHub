import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button'
}: ButtonProps) {
    const baseStyles = "flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 text-sm font-bold tracking-[0.015em] transition-colors";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4"
    };

    return (
        <button
            type={type}
            className={cn(baseStyles, variants[variant], className)}
            onClick={onClick}
        >
            {children}
        </button>
    );
}