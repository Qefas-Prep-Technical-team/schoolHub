import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
    children: ReactNode;
    variant: 'primary' | 'secondary' | 'outline';
    onClick?: () => void;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant, onClick, className = '' }) => {
    const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-medium leading-normal tracking-[0.015em]";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        outline: "bg-transparent text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            onClick={onClick}
        >
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;