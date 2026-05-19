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
    <div className="flex border-b border-gray-150 dark:border-gray-700 gap-8 overflow-x-auto scrollbar-none px-4">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              py-3.5 px-2 text-sm font-bold tracking-[0.015em] transition-all duration-200
              border-b-2 whitespace-nowrap focus:outline-none
              ${isActive 
                ? 'border-primary text-primary dark:text-primary font-black' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
