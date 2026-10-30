'use client';

import { Tabs, TabList, Tab } from 'react-tabs';
import { 
  FileText, 
  BookOpen, 
  Calendar, 
  BookText, 
  CheckCircle2, 
  MessageSquare 
} from 'lucide-react';
import 'react-tabs/style/react-tabs.css';

interface TabNavigationProps {
  activeTab: 'assessments' | 'materials' | 'timetable' | 'attendance' | 'discussions';
  onTabChange: (tab: 'assessments' | 'materials' | 'timetable' | 'attendance' | 'discussions') => void;
  children?: React.ReactNode;
}

const tabs = [
  { id: 'assessments', label: 'Assessments', icon: FileText },
  { id: 'materials', label: 'Materials', icon: BookOpen },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
] as const;

export default function ClassTabs({
  activeTab,
  onTabChange,
  children,
}: TabNavigationProps) {
  const selectedIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <Tabs
      selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
      onSelect={(index) => onTabChange(tabs[index].id)}
      className="w-full"
    >
      <div className="w-full border-b border-slate-200/80 dark:border-slate-800 mb-6">
        <TabList className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 outline-none select-none border border-transparent"
                selectedClassName="!bg-pink-50 !text-pink-600 dark:!bg-pink-950/40 dark:!text-pink-400 !border-pink-200/80 dark:!border-pink-800/50 shadow-2xs !font-extrabold"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </Tab>
            );
          })}
        </TabList>
      </div>

      {children}
    </Tabs>
  );
}

