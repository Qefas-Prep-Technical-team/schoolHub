// src/components/Header/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
    status: 'present' | 'absent' | 'late';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusConfig = () => {
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

    const config = getStatusConfig();

    return (
        <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
            {config.text}
        </div>
    );
};

export default StatusBadge;