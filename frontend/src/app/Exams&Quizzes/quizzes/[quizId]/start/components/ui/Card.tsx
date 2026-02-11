import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline' | 'filled';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        let variantClasses = '';

        switch (variant) {
            case 'outline':
                variantClasses = 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
                break;
            case 'filled':
                variantClasses = 'bg-gray-50 dark:bg-gray-900';
                break;
            case 'default':
            default:
                variantClasses = 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
        }

        return (
            <div
                ref={ref}
                className={cn('rounded-lg shadow-sm p-4', variantClasses, className)}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('p-4', className)}
                {...props}
            />
        );
    }
);

CardContent.displayName = 'CardContent';

export { Card, CardContent };
