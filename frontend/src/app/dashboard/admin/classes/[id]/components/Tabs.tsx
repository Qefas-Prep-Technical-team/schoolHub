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
    <div className="inline-flex gap-1 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[20px] overflow-x-auto scrollbar-none w-full sm:w-auto shadow-inner border border-gray-200/50 dark:border-gray-700/50">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 rounded-2xl whitespace-nowrap focus:outline-none flex-shrink-0
              ${isActive 
                ? 'bg-white dark:bg-[#253046] text-primary dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 transform scale-100' 
                : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
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
