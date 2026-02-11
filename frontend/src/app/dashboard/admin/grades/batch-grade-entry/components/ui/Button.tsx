import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'icon';
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
        primary: "bg-primary text-white hover:bg-primary/90 focus:ring-4 focus:ring-primary/30 h-12 px-6 text-base",
        secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 h-10 px-4",
        icon: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 h-10 w-10 p-0"
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