import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
    text: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

export default function StatusBadge({
    variant,
    text,
    size = 'md',
    className,
}: StatusBadgeProps) {
    const variantClasses = {
        success: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        danger: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        default: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    };

    const sizeClasses = {
        xs: 'text-[10px] px-2 py-0.5',
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    return (
        <span className={cn(
            'inline-flex items-center rounded font-medium w-fit',
            variantClasses[variant],
            sizeClasses[size],
            className
        )}>
            {text}
        </span>
    );
}