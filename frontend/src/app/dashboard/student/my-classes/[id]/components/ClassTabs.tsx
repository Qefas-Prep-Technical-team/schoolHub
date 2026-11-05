'use client';

import React from 'react';
import {
  FileText,
  BookOpen,
  Calendar,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export type ClassTabId = 'assessments' | 'materials' | 'timetable' | 'attendance' | 'discussions';

interface TabNavigationProps {
  activeTab: ClassTabId;
  onTabChange: (tab: ClassTabId) => void;
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
  return (
    <div className="w-full">
      <div className="w-full border-b border-slate-200/80 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 outline-none select-none border ${isSelected
                    ? "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border-pink-200/80 dark:border-pink-800/50 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 border-transparent"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
