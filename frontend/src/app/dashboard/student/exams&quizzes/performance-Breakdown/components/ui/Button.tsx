import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    icon?: ReactNode;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    icon,
}: ButtonProps) {
    const baseClasses = 'flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50';

    const variantClasses = {
        primary: 'bg-primary text-white shadow-md hover:bg-primary/90',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-base',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
        >
            {icon}
            {children}
        </button>
    );
}