// src/components/UI/Badge.tsx
import React from 'react';

interface BadgeProps {
    status: 'present' | 'absent' | 'late' | 'excused';
}

const Badge: React.FC<BadgeProps> = ({ status }:{status:string}) => {
    const getConfig = () => {
        switch (status) {
            case 'present':
                return {
                    text: 'Present',
                    bgColor: 'bg-green-100 dark:bg-green-900',
                    textColor: 'text-green-800 dark:text-green-300',
                };
            case 'absent':
                return {
                    text: 'Absent',
                    bgColor: 'bg-red-100 dark:bg-red-900',
                    textColor: 'text-red-800 dark:text-red-300',
                };
            case 'late':
                return {
                    text: 'Late',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
                    textColor: 'text-yellow-800 dark:text-yellow-300',
                };
            case 'excused':
                return {
                    text: 'Excused',
                    bgColor: 'bg-blue-100 dark:bg-blue-900',
                    textColor: 'text-blue-800 dark:text-blue-300',
                };
            default:
                return {
                    text: 'Unknown',
                    bgColor: 'bg-gray-100 dark:bg-gray-900',
                    textColor: 'text-gray-800 dark:text-gray-300',
                };
        }
    };

    const config = getConfig();

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.text}
        </span>
    );
};

export default Badge;