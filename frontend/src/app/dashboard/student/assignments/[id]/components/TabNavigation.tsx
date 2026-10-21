'use client';

import { cn } from '@/lib/utils';
import { BookOpen, Zap, Paperclip, Award, FolderOpen } from 'lucide-react';

interface Props {
  activeTab: 'instructions' | 'attachments' | 'rubric' | 'materials' | 'quiz';
  onTabChange: (tab: 'instructions' | 'attachments' | 'rubric' | 'materials' | 'quiz') => void;
  attachmentsCount?: number;
  questionsCount?: number;
  isGraded?: boolean;
}

export default function TabNavigation({ 
  activeTab, 
  onTabChange, 
  attachmentsCount = 0, 
  questionsCount = 0, 
  isGraded = false 
}: Props) {
  const tabs = [
    { 
      id: 'instructions' as const, 
      label: 'Instructions',
      icon: BookOpen,
      count: undefined 
    },
    ...(questionsCount > 0 ? [{ 
      id: 'quiz' as const, 
      label: isGraded ? 'Review Quiz' : 'Quiz',
      icon: Zap,
      count: questionsCount 
    }] : []),
    { 
      id: 'attachments' as const, 
      label: 'Attachments',
      icon: Paperclip,
      count: attachmentsCount > 0 ? attachmentsCount : undefined 
    },
    { 
      id: 'rubric' as const, 
      label: 'Rubric',
      icon: Award,
      count: undefined 
    },
    { 
      id: 'materials' as const, 
      label: 'Materials',
      icon: FolderOpen,
      count: undefined 
    },
  ];

  return (
    <div className="w-full mb-5 sm:mb-6">
      <div className="overflow-x-auto no-scrollbar scroll-smooth py-1">
        <nav 
          className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs w-max min-w-full sm:min-w-0" 
          aria-label="Assignment Tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 outline-none select-none",
                  isActive
                    ? "bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-xs scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-pink-600 dark:text-pink-400" : "text-slate-400")} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none",
                    isActive
                      ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                      : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}