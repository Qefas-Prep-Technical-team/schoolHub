// src/components/Header/PageHeader.tsx
import React from 'react';
import StatusBadge from './StatusBadge';

const PageHeader: React.FC = () => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2">
                <p className="text-gray-900 dark:text-white text-3xl lg:text-4xl font-black tracking-[-0.033em]">
                    Tuesday, October 26, 2024
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal">
                    Daily Attendance
                </p>
            </div>
            <StatusBadge status="absent" />
        </div>
    );
};

export default PageHeader;