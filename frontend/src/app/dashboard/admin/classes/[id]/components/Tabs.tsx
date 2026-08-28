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
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0 px-2 sm:px-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 rounded-full whitespace-nowrap focus:outline-none
              ${isActive 
                ? 'bg-primary text-white shadow-sm font-bold' 
                : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
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
