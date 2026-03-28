import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
    onClick?: () => void;
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    onClick
}: ButtonProps) {
    const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] gap-2";

    const variants = {
        primary: "bg-primary text-white",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}