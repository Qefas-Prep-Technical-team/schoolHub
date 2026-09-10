'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileText, ClipboardList, PenTool, CalendarDays, CheckSquare } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'overview' | 'students' | 'assignments' | 'grades'| 'exams&quizzes' | 'timetable' | 'attendance';
  onTabChange: (tab: 'overview' | 'students' | 'assignments' | 'grades'|'exams&quizzes' | 'timetable' | 'attendance') => void;
  children?: React.ReactNode;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'timetable', label: 'Time Table', icon: CalendarDays },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'exams&quizzes', label: 'Exams & Quizzes', icon: PenTool },
  { id: 'grades', label: 'Grades', icon: FileText },
] as const;

export default function TabNavigation({
  activeTab,
  onTabChange,
  children,
}: TabNavigationProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-emerald-950/60 backdrop-blur-md rounded-[1.8rem] shadow-inner border border-slate-200/50 dark:border-emerald-800/50 flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl cursor-pointer focus:outline-none transition-colors duration-500 overflow-hidden group select-none"
            >
              <div className="relative z-10 flex items-center gap-2.5">
                <tab.icon
                  size={16}
                  className={`transition-colors duration-500 ${activeTab === tab.id ? 'text-white dark:text-slate-900' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500 ${activeTab === tab.id ? 'text-white dark:text-slate-900' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                  {tab.label}
                </span>
              </div>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-class-tab-bg"
                  className="absolute inset-0 bg-emerald-600 shadow-lg shadow-emerald-600/20 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}
