import React from 'react';
import { ShieldCheck, Clock, Mail } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LinkingStatsProps {
  activeCount: number;
  pendingCount: number;
  totalCount: number;
  usage?: {
    students: number;
    plan: string;
  } | null;
  limits?: {
    students: number;
    classes: number;
  } | null;
}

export function LinkingStats({ activeCount, pendingCount, totalCount, usage, limits }: LinkingStatsProps) {
  const studentUsage = usage?.students || 0;
  const studentLimit = limits?.students || 0;
  const isLimitReached = studentLimit > 0 && studentUsage >= studentLimit;
  const usagePercentage = studentLimit > 0 ? Math.min(100, (studentUsage / studentLimit) * 100) : 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
      <Card className="rounded-3xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2 text-blue-600 dark:text-blue-400">
            <ShieldCheck size={20} />
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none">Active</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{activeCount}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Connections</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-blue-500 focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Total number of verified network links currently established between parents, students, and teachers.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2 text-primary dark:text-orange-400">
            <Clock size={20} />
            <Badge className="bg-primary/10 text-primary dark:text-orange-400 border-none shadow-none">Pending</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{pendingCount}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Requests</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-primary focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Unprocessed connection requests awaiting administrative approval or rejection.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 col-span-2 md:col-span-1">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2 text-purple-600 dark:text-purple-400">
            <Mail size={20} />
            <Badge className={cn(
              "border-none shadow-none",
              isLimitReached ? "bg-red-500/10 text-red-600" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
            )}>
              {usage?.plan || 'Total'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-gray-900 dark:text-white">{studentUsage}</p>
            {studentLimit > 0 && (
              <p className="text-sm font-bold text-gray-400">/ {studentLimit}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">All Students</p>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-400 hover:text-purple-500 focus:outline-none">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  Total student seat utilization relative to your active subscription plan limit.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {studentLimit > 0 && (
            <div className="mt-3 overflow-hidden h-1.5 bg-purple-200 dark:bg-purple-900/30 rounded-full">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  isLimitReached ? "bg-red-500" : "bg-purple-500"
                )} 
                style={{ width: `${usagePercentage}%` }} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

