// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
    onClick,
    disabled = false,
    type = 'button'
}) => {
    const baseClasses = 'flex cursor-pointer items-center justify-center overflow-hidden rounded-lg font-bold leading-normal tracking-wide hover:transition-colors disabled:cursor-not-allowed disabled:opacity-50';

    const sizeClasses = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
        outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    };

    return (
        <button
            type={type}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;