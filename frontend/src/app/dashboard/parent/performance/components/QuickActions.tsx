"use client";

import {
  ChevronRight,
  FileText,
  Target,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  href: string;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: 1,
      title: 'Subject Breakdown',
      description: 'In-depth mastery by topic & syllabus',
      icon: <Target className="h-4.5 w-4.5" />,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-950/60',
      href: '/dashboard/parent/performance/subject-performance'
    },
    {
      id: 2,
      title: 'Termly Result Sheets',
      description: 'Official continuous assessment sheets',
      icon: <ClipboardList className="h-4.5 w-4.5" />,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      href: '/dashboard/parent/result/termly'
    },
    {
      id: 3,
      title: 'Exam Records & Tests',
      description: 'Full attempt history & paper reviews',
      icon: <FileText className="h-4.5 w-4.5" />,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-950/60',
      href: '/dashboard/parent/exams&results'
    },
  ];

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-center">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Quick Portals
        </h3>
        <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
          Shortcuts
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex items-center justify-between w-full group p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-slate-800/90 rounded-2xl transition-all duration-200 border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/40 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`${action.iconBg} ${action.iconColor} p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105`}>
                {action.icon}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {action.title}
                </p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {action.description}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
