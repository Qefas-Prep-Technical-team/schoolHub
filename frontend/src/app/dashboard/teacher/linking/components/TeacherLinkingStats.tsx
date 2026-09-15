import React from 'react';
import { ShieldCheck, Clock, Mail } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  isPersonal
}: TeacherLinkingStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="rounded-3xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-blue-600 dark:text-blue-400">
            <ShieldCheck size={20} />
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none">Active</Badge>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {isLoadingActive ? <Skeleton className="h-9 w-12" /> : activeCount}
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
            {isPersonal ? 'Current Tab Active' : 'School Connections'}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-primary dark:text-orange-400">
            <Clock size={20} />
            <Badge className="bg-primary/10 text-primary dark:text-orange-400 border-none shadow-none">Waiting</Badge>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {isLoadingPending ? <Skeleton className="h-9 w-12" /> : pendingCount}
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
            Current Tab Pending
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-purple-600 dark:text-purple-400">
            <Mail size={20} />
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none shadow-none">
              Context
            </Badge>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white truncate">
            {workspaceName}
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
            Active Workspace
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
