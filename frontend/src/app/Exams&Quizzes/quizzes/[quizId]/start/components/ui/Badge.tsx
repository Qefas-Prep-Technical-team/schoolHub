import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        let variantClasses = '';

        if (variant === 'primary') {
            variantClasses = 'bg-primary/10 text-primary';
        } else if (variant === 'secondary') {
            variantClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        } else if (variant === 'outline') {
            variantClasses = 'border border-gray-200 dark:border-gray-700';
        } else {
            // default
            variantClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    variantClasses,
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge };
