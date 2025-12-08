// src/components/UI/Button.tsx
import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: string;
    className?: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    icon,
    className = '',
    onClick,
}) => {
    const baseClasses = 'flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal';

    const variants = {
        primary: 'bg-primary text-white',
        secondary: 'bg-transparent text-primary dark:text-primary-300 border border-primary dark:border-primary-300 hover:bg-primary/10',
        outline: 'bg-white dark:bg-[#1C2431] border border-gray-200 dark:border-gray-700 text-[#0e121b] dark:text-gray-300',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;