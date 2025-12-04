'use client';

import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface TabNavigationProps {
  activeTab: 'overview' | 'students' | 'assignments' | 'grades'| 'exams&quizzes';
  onTabChange: (tab: 'overview' | 'students' | 'assignments' | 'grades'|'exams&quizzes') => void;
  children?: React.ReactNode;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'students', label: 'Students' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'exams&quizzes', label: 'Exams&Quizzes' },
  { id: 'grades', label: 'Grades' },
] as const;

export default function TabNavigation({
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
