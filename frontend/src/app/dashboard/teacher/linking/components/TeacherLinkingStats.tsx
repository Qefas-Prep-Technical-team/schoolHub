'use client';

import React from 'react';
import { ShieldCheck, Clock, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface TeacherLinkingStatsProps {
  activeCount: number;
  pendingCount: number;
  workspaceName: string;
  isLoadingActive?: boolean;
  isLoadingPending?: boolean;
  isPersonal?: boolean;
}

export function TeacherLinkingStats({
  activeCount,
  pendingCount,
  workspaceName,
  isLoadingActive,
  isLoadingPending,
  isPersonal,
}: TeacherLinkingStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {/* Card 1: Active Connections */}
      <Card className="rounded-2xl shadow-sm bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40 hover:shadow-md transition-shadow">
        <CardContent className="p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-2 text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={18} />
              <HeaderTooltip
                content="Verified, fully active bidirectional connections between your account and linked scholars, guardians, or classes."
                size={12}
              />
            </div>
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none text-[10px] font-bold uppercase tracking-wider">
              Active
            </Badge>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isLoadingActive ? <Skeleton className="h-8 w-12 rounded-lg" /> : activeCount}
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            {isPersonal ? 'Current Tab Active' : 'School Connections'}
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Pending Requests */}
      <Card className="rounded-2xl shadow-sm bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40 hover:shadow-md transition-shadow">
        <CardContent className="p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-2 text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-1.5">
              <Clock size={18} />
              <HeaderTooltip
                content="Pending link requests awaiting your confirmation or target recipient approval before data sharing is unlocked."
                size={12}
              />
            </div>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none shadow-none text-[10px] font-bold uppercase tracking-wider">
              Waiting
            </Badge>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {isLoadingPending ? <Skeleton className="h-8 w-12 rounded-lg" /> : pendingCount}
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Current Tab Pending
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Active Workspace Context (Spans 2 columns on mobile/tablet) */}
      <Card className="col-span-2 lg:col-span-1 rounded-2xl shadow-sm bg-white dark:bg-emerald-950/40 border border-slate-200/80 dark:border-emerald-800/40 hover:shadow-md transition-shadow">
        <CardContent className="p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-2 text-purple-600 dark:text-purple-400">
            <div className="flex items-center gap-1.5">
              <Mail size={18} />
              <HeaderTooltip
                content="Current operating authority context for this session (Personal Classroom Workspace or Institutional School)."
                size={12}
              />
            </div>
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none shadow-none text-[10px] font-bold uppercase tracking-wider">
              Context
            </Badge>
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white truncate">
            {workspaceName}
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Active Workspace
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
