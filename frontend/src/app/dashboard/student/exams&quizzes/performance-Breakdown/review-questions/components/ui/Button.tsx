import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    icon,
    iconPosition = 'left',
}: ButtonProps) {
    const baseClasses = 'flex items-center justify-center gap-2 rounded-lg font-medium transition-colors';
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
        outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
        >
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
        </button>
    );
}