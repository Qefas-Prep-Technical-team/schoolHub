import React from 'react';


interface PageHeaderProps {
  title: string;
  showSyncStatus?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showSyncStatus = true }) => {
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '#' },
          { label: 'Grades', href: '#' },
          { label: 'Record Grades', isActive: true },
        ]}
      />
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-gray-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
          {title}
        </h1>
        {showSyncStatus && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-base">sync</span>
            <span>All changes saved</span>
          </div>
        )}
      </div>
    </div>
  );
};

import Breadcrumbs from './Breadcrumbs';
export default PageHeader;