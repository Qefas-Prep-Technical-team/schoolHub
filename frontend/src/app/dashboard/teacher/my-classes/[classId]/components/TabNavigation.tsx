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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-slate-100 dark:bg-emerald-950/60 backdrop-blur-md rounded-2xl sm:rounded-[1.8rem] shadow-inner border border-slate-200/50 dark:border-emerald-800/50 w-full sm:w-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl cursor-pointer focus:outline-none transition-colors duration-300 overflow-hidden group select-none shrink-0"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <tab.icon
                    size={16}
                    className={`transition-colors duration-300 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                    {tab.label}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="active-class-tab-bg"
                    className="absolute inset-0 bg-emerald-600 shadow-md shadow-emerald-600/30 rounded-xl sm:rounded-2xl"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {children && (
        <div className="mt-2 sm:mt-4">
          {children}
        </div>
      )}
    </div>
  );
}
