// src/components/UI/Badge.tsx
import React from 'react';

interface BadgeProps {
    status: 'present' | 'absent' | 'late';
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
    const getConfig = () => {
        switch (status) {
            case 'present':
                return {
                    text: 'Present',
                    bgColor: 'bg-green-100 dark:bg-green-900/50',
                    textColor: 'text-green-700 dark:text-green-300'
                };
            case 'absent':
                return {
                    text: 'Absent',
                    bgColor: 'bg-red-100 dark:bg-red-900/50',
                    textColor: 'text-red-700 dark:text-red-300'
                };
            case 'late':
                return {
                    text: 'Late',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
                    textColor: 'text-yellow-700 dark:text-yellow-300'
                };
        }
    };

    const config = getConfig();

    return (
        <p className={`text-sm font-medium px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
            {config.text}
        </p>
    );
};

export default Badge;
