// src/components/UI/Badge.tsx
import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'success' }) => {
    const variantClasses = {
        success: 'bg-secondary/10 text-secondary dark:bg-secondary/20',
        warning: 'bg-warning/10 text-warning dark:bg-warning/20',
        danger: 'bg-red-500/10 text-red-500 dark:bg-red-500/20',
        info: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20'
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]}`}>
            {children}
        </span>
    );
};

export default Badge;