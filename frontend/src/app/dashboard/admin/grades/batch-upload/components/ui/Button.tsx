import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button',
    disabled = false
}: ButtonProps) {
    const baseStyles = "flex cursor-pointer items-center justify-center overflow-hidden rounded-lg text-sm font-bold leading-normal tracking-[0.015em] gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 h-12 px-5",
        secondary: "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 h-10 px-4"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}