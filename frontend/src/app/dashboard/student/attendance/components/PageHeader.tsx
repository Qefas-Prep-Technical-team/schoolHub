// src/components/Header/PageHeader.tsx
import React from 'react';
import SegmentedControl from './SegmentedControl';

interface PageHeaderProps {
    records?: any[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ records = [] }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <p className="text-text-light-primary dark:text-dark-primary text-3xl font-bold leading-tight">
                Attendance Overview
            </p>
            <SegmentedControl records={records} />
        </div>
    );
};

export default PageHeader;
