'use client';

import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface TabNavigationProps {
  activeTab:  'assignments' | 'materials' | 'attendance' | 'discussions';
  onTabChange: (tab:  'assignments' | 'materials' | 'attendance' | 'discussions') => void;
  children?: React.ReactNode;
}

const tabs = [
  { id: 'assignments', label: 'Assignments' },
  { id: 'materials', label: 'Materials' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'discussions', label: 'Discussions' },
] as const;

export default function ClassTabs({
  activeTab,
  onTabChange,
  children,
}: TabNavigationProps) {
  const selectedIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <Tabs
      selectedIndex={selectedIndex}
      onSelect={(index) => onTabChange(tabs[index].id)}
      className="w-full"
    >
      <TabList className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            className={`
              py-3 px-4 md:px-6 text-sm font-bold cursor-pointer 
              focus:outline-none
            `}
            selectedClassName="text-primary border-b-2 border-primary"
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>

      {children}
    </Tabs>
  );
}
