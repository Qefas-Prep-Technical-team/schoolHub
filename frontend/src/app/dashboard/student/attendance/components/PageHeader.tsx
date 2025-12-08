// src/components/Header/PageHeader.tsx
import React from 'react';
import SegmentedControl from './SegmentedControl';

const PageHeader: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <p className="text-text-light-primary dark:text-dark-primary text-3xl font-bold leading-tight">
                Attendance Overview
            </p>
            <SegmentedControl />
        </div>
    );
};

export default PageHeader;