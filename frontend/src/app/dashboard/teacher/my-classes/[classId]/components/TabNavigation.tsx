'use client';

import { Tabs, TabList, Tab } from 'react-tabs';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileText, ClipboardList, PenTool, Sparkles } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'overview' | 'students' | 'assignments' | 'grades'| 'exams&quizzes';
  onTabChange: (tab: 'overview' | 'students' | 'assignments' | 'grades'|'exams&quizzes') => void;
  children?: React.ReactNode;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'exams&quizzes', label: 'Exams & Quizzes', icon: PenTool },
  { id: 'grades', label: 'Grades', icon: FileText },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <TabList className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md rounded-[1.8rem] shadow-inner border border-slate-200/50 dark:border-slate-700/50">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className="relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl cursor-pointer focus:outline-none transition-colors duration-500 overflow-hidden group select-none"
            >
              <div className="relative z-10 flex items-center gap-2.5">
                  <tab.icon 
                    size={16} 
                    className={`transition-colors duration-500 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} 
                    strokeWidth={activeTab === tab.id ? 2.5 : 2}
                  />
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                    {tab.label}
                  </span>
              </div>
              
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-class-tab-bg"
                  className="absolute inset-0 bg-primary shadow-lg shadow-primary/20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
            </Tab>
          ))}
        </TabList>

        <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-5 py-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/50">
           <Sparkles size={14} className="text-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Insight System Active</span>
        </div>
      </div>

      <div className="mt-4">
        {children}
      </div>
    </Tabs>
  );
}
