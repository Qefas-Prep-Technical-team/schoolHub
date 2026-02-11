import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button'
}: ButtonProps) {
    const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-medium gap-2";

    const variants = {
        primary: "bg-primary text-white",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        outline: "bg-primary/20 dark:bg-primary/30 text-primary dark:text-white"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}