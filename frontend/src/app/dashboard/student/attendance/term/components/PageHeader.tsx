// src/components/Header/PageHeader.tsx
import React from 'react';
import ActionButtons from './ActionButtons';

const PageHeader: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <p className="text-[#111827] dark:text-white text-3xl font-bold tracking-tight">
        Term Attendance Report
      </p>
      <ActionButtons />
    </div>
  );
};

export default PageHeader;