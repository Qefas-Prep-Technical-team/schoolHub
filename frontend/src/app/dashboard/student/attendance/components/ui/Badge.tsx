// src/components/UI/Badge.tsx
import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'blue' }) => {
    const colorClasses = {
        green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClasses[color]}`}>
            {children}
        </span>
    );
};

export default Badge;