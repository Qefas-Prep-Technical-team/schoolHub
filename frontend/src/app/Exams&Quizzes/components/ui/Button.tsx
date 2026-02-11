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
    const baseStyles = "flex cursor-pointer items-center justify-center overflow-hidden transition-colors";

    const variants = {
        primary: "bg-primary-action text-white hover:bg-blue-600 rounded-lg h-12 text-base font-bold px-8",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg px-4 py-2",
        icon: "rounded-full bg-gray-100 dark:bg-gray-800 text-secondary-text dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 h-10 w-10"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}