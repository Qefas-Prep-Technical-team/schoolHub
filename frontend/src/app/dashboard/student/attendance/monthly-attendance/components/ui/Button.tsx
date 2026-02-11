// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
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
    onClick,
}) => {
    const baseClasses = 'flex items-center justify-center rounded-md hover:bg-primary/10 text-text-light-primary dark:text-text-dark-primary transition-colors';

    const sizeClasses = {
        sm: 'p-2',
        md: 'px-4 py-2',
        lg: 'px-6 py-3',
    };

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark',
        ghost: 'bg-transparent hover:bg-primary/10',
        outline: 'bg-transparent border border-border-light dark:border-border-dark',
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
        >
            {icon && (
                <span className="material-symbols-outlined text-lg">
                    {icon}
                </span>
            )}
            {children && icon ? (
                <span className="ml-2 text-sm font-medium">{children}</span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;