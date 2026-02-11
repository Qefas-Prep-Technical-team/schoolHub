import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'icon';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
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
    const baseStyles = "flex cursor-pointer items-center justify-center overflow-hidden rounded-lg text-sm font-bold leading-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:opacity-90 px-6 h-11",
        secondary: "bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600 px-6 h-11",
        icon: "p-2"
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