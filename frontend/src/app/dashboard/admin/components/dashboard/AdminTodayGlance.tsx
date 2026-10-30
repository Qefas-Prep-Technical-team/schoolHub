'use client';

import { CheckCircle2, GraduationCap, CreditCard, ClipboardList, Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface AdminTodayGlanceProps {
  stats: {
    students?: number;
    teachers?: number;
    classes?: number;
    subjects?: number;
    exams?: number;
  } | null | undefined;
}

export default function AdminTodayGlance({ stats }: AdminTodayGlanceProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Today at a glance</h3>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                Provides a real-time snapshot of the school's operational capacity and registered entities. Monitoring these aggregates helps identify immediate discrepancies in expected enrollment or staffing numbers.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-slate-500">Live operations summary</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Total Students</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {stats?.students?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <GraduationCap size={16} className="text-blue-500" />
            <span>Total Teachers</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {stats?.teachers?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px]">🏢</div>
            <span>Total Classes</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {stats?.classes?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CreditCard size={16} className="text-purple-500" />
            <span>Total Subjects</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {stats?.subjects?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ClipboardList size={16} className="text-slate-500" />
            <span>Active Exams</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {stats?.exams?.toLocaleString() || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
