import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant: 'primary' | 'secondary' | 'outline';
    onClick?: () => void;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant, onClick, className = '' }) => {
    const baseStyles = "flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-medium leading-normal tracking-[0.015em]";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600",
        outline: "bg-transparent text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;