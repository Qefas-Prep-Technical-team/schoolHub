// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    className?: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    onClick
}) => {
    const baseClasses = 'flex items-center justify-center gap-2 rounded-full font-bold transition focus:outline-none focus:ring-4';

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'py-3 px-6 text-base',
    };

    const variantClasses = {
        primary: 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 focus:ring-primary/50',
        secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
        ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;