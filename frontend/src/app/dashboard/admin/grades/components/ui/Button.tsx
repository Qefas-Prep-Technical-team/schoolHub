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
    const baseStyles = "flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 text-sm font-bold tracking-[0.015em] gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 px-4",
        secondary: "bg-white dark:bg-[#1C1C2D] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 px-4"
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