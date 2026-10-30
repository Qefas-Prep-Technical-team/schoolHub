'use client';

import { Users, GraduationCap, CheckCircle2, CreditCard } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface AdminStatsGridProps {
  stats: {
    students?: number;
    teachers?: number;
    classes?: number;
    subjects?: number;
  } | null | undefined;
}

export default function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Students */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Total Students</span>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Reflects the total count of active, enrolled student accounts in the current session. A sudden drop may indicate unrecorded transfers or system data loss.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {stats?.students?.toLocaleString() || 0}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">Active</span>
            <span>enrolled accounts</span>
          </div>
        </div>
      </div>

      {/* Total Teachers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Total Teachers</span>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Reflects the total count of active faculty staff members. Use this metric to ensure you maintain optimal student-to-teacher ratios across the institution.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <GraduationCap size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {stats?.teachers?.toLocaleString() || 0}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">Verified</span>
            <span>faculty staff</span>
          </div>
        </div>
      </div>

      {/* Total Classes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Total Classes</span>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Reflects the total number of distinct classroom cohorts configured. Useful for auditing spatial requirements and general school capacity.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CheckCircle2 size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {stats?.classes?.toLocaleString() || 0}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">Active</span>
            <span>classrooms</span>
          </div>
        </div>
      </div>

      {/* Total Subjects */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Total Subjects</span>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Reflects the breadth of your academic curriculum. Monitoring this ensures curriculum diversity and highlights potential gaps in educational offerings.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CreditCard size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {stats?.subjects?.toLocaleString() || 0}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">Curriculum</span>
            <span>registered subjects</span>
          </div>
        </div>
      </div>
    </div>
  );
}
