import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AlertProps {
    children: ReactNode;
    variant?: 'error' | 'warning' | 'success' | 'info';
    icon?: LucideIcon;
    className?: string;
}

export default function Alert({
    children,
    variant = 'info',
    icon: Icon,
    className = ''
}: AlertProps) {
    const variantStyles = {
        error: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50',
        warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50',
        success: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50',
        info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
    };

    return (
        <div className={`flex items-center gap-3 p-3 text-sm rounded-lg ${variantStyles[variant]} ${className}`}>
            {Icon && <Icon size={20} />}
            {children}
        </div>
    );
}