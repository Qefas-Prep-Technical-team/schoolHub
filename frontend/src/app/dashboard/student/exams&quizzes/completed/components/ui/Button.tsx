import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    icon?: ReactNode;
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'outline',
    size = 'md',
    className = '',
    onClick,
    icon,
    fullWidth = false,
}: ButtonProps) {
    const baseClasses = 'flex items-center justify-center gap-x-2 rounded-full font-medium leading-normal transition-colors';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
        outline: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
        ghost: 'text-primary hover:bg-primary/10',
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
            onClick={onClick}
        >
            {icon}
            {children}
        </button>
    );
}