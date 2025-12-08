// src/components/UI/Badge.tsx
import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'status' | 'primary' | 'success' | 'warning' | 'danger';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary' }) => {
    const variantClasses = {
        status: 'bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary',
        primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
        success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
        warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
        danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variantClasses[variant]}`}>
            {children}
        </span>
    );
};

export default Badge;