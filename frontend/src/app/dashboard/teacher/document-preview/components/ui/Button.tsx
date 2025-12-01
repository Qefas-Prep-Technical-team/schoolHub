import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: string;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    icon,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    fullWidth = false
}) => {
    const baseStyles = `flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 text-base font-bold leading-normal shadow-sm transition-colors ${fullWidth ? 'w-full' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        outline: "bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/10"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="material-symbols-outlined mr-2">{icon}</span>}
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;