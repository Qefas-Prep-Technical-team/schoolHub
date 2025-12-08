// src/components/UI/Button.tsx
import Link from 'next/link';
import React from 'react';

interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
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
    const baseClasses = 'flex items-center justify-center gap-2 rounded-lg font-bold shadow-sm transition-all hover:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50';

    const sizeClasses = {
        sm: 'h-10 px-2.5 text-sm font-bold leading-normal tracking-[0.015em]',
        md: 'h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em]',
        lg: 'px-8 py-3 text-base font-bold',
    };

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-[#e8ebf3] dark:bg-gray-700 text-[#0e121b] dark:text-white',
        ghost: 'bg-transparent hover:bg-[#e8ebf3] dark:hover:bg-gray-700',
        outline: 'bg-transparent border border-gray-300 dark:border-gray-600',
    };

    return (
        <Link href={"/Exams&Quizzes/exam/1/start"}>
            <button
                type={type}
                className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} cursor-pointer`}
                onClick={onClick}
                disabled={disabled}
            >
                {icon && <span className="material-symbols-outlined">{icon}</span>}
                {children}
            </button>
        </Link>
    );
};

export default Button;