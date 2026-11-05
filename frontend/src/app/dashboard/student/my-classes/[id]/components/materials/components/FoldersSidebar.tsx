'use client';

import React from 'react';
import {
  FileDown,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  HelpCircle,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MaterialSubTab, RoleTheme, getThemeTokens } from './types';

interface FoldersSidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  selectedSubTab: MaterialSubTab;
  onSubTabSelect: (tab: MaterialSubTab) => void;
  role?: RoleTheme;
  counts: {
    all: number;
    filesOnly: number;
    exams: number;
    assignments: number;
    ca: number;
    testQuiz: number;
  };
}

const SUB_TABS: Array<{ id: MaterialSubTab; label: string; icon: React.ElementType; key: keyof FoldersSidebarProps['counts'] }> = [
  { id: 'ALL', label: 'All Resources', icon: Layers, key: 'all' },
  { id: 'FILES_ONLY', label: 'Files & Media', icon: FileDown, key: 'filesOnly' },
  { id: 'ASSIGNMENTS', label: 'Assignments', icon: BookOpen, key: 'assignments' },
  { id: 'EXAMS', label: 'Exams', icon: GraduationCap, key: 'exams' },
  { id: 'CA', label: 'Continuous Assessment', icon: ClipboardCheck, key: 'ca' },
  { id: 'TEST_QUIZ', label: 'Tests & Quizzes', icon: HelpCircle, key: 'testQuiz' },
];

export default function FoldersSidebar({
  selectedSubTab,
  onSubTabSelect,
  counts,
  role = 'student'
}: FoldersSidebarProps) {
  const theme = getThemeTokens(role);

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Resource Streams
        </h2>
        <span className="text-[11px] font-bold text-slate-400 font-mono">
          {counts.all} total
        </span>
      </div>

      <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedSubTab === tab.id;
          const count = counts[tab.key] || 0;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onSubTabSelect(tab.id)}
              className={cn(
                'flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left whitespace-nowrap shrink-0 border cursor-pointer',
                isSelected
                  ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-xs font-black`
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={cn('h-4 w-4 shrink-0', isSelected ? theme.primaryText : 'text-slate-400')} />
                <span className="truncate">{tab.label}</span>
              </div>
              <span className={cn(
                'text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 font-mono',
                isSelected
                  ? `${theme.primaryText} bg-white/60 dark:bg-slate-800/80 shadow-2xs`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
