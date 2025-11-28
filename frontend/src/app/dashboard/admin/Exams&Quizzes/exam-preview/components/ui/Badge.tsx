import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'secondary';
    className?: string;
}

export default function Badge({
    children,
    variant = 'default',
    className = ''
}: BadgeProps) {
    const baseStyles = "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium leading-normal";

    const variants = {
        default: "",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}