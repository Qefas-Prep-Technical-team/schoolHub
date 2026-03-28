import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // keep default styles

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
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <Tabs
      selectedIndex={activeIndex}
      onSelect={(index) => onTabChange(tabs[index].id)}
    >
      <TabList className="flex border-b border-gray-200 dark:border-gray-700 gap-8">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            className={`
              py-3 px-1 text-sm font-bold tracking-[0.015em] 
              text-gray-500 dark:text-gray-400 
              hover:text-gray-700 hover:border-gray-300 
              dark:hover:text-gray-300 dark:hover:border-gray-600
              border-b-2 border-transparent
              cursor-pointer
            `}
            selectedClassName="border-b-2 border-primary text-primary"
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>

      {tabs.map((tab) => (
        <TabPanel key={tab.id} className="mt-4">
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default CustomTabs;
