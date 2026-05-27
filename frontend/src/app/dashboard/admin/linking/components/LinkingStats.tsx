import React from 'react';
import { ShieldCheck, Clock, Mail } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="rounded-3xl border-none shadow-sm bg-blue-500/5 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-blue-600 dark:text-blue-400">
            <ShieldCheck size={20} />
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none shadow-none">Active</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{activeCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Active Connections</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/15/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2 text-primary dark:text-orange-400">
            <Clock size={20} />
            <Badge className="bg-primary/10 text-primary dark:text-orange-400 border-none shadow-none">Pending</Badge>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{pendingCount}</p>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Pending Requests</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm bg-purple-500/5 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/20">
        <CardContent className="p-6">
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
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">All Students</p>
          
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

