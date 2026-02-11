// src/components/Header/PageHeader.tsx
import React from 'react';
import MobileNavToggle from './MobileNavToggle';

const PageHeader: React.FC = () => {
    return (
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Subject-wise Attendance
            </h1>
            <MobileNavToggle />
        </div>
    );
};

export default PageHeader;