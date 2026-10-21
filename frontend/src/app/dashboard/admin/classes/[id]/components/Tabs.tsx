import React from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface CustomTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CustomTabs: React.FC<CustomTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="inline-flex gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-[20px] overflow-x-auto no-scrollbar w-full sm:w-auto shadow-2xs border border-slate-200/80 dark:border-slate-800">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 rounded-xl sm:rounded-2xl whitespace-nowrap flex-shrink-0 cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 dark:bg-indigo-600 dark:text-white dark:shadow-indigo-900/50' 
                : 'bg-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/80'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default CustomTabs;
