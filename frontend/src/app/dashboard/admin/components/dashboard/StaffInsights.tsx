'use client';

import { Users, UserX, Building, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import ProgressBar from './ui/ProgressBar';
import { useSchoolDashboardSummary } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StaffInsight {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  severity: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function StaffInsights() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';
  
  const { data: summary, isLoading } = useSchoolDashboardSummary(schoolId);

  const insights = useMemo<StaffInsight[]>(() => {
    if (!summary) return [];

    const list: StaffInsight[] = [];

    // 1. Unassigned Teachers Insight
    if (summary.unassignedCount > 0) {
      list.push({
        id: 'unassigned',
        title: `${summary.unassignedCount} Unassigned Teachers`,
        description: `Faculty members like ${summary.unassignedTeachers.map(t => t.name).join(', ')} are pending class allocation.`,
        icon: UserX,
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        severity: 'high',
        action: {
          label: 'Assign Now',
          onClick: () => console.log('Assign teachers'),
        },
      });
    }

    // 2. Class Coverage Insight
    const classesWithTeachers = summary.classesSummary.filter(c => c.teacherCount > 0);
    const lowCoverageClasses = summary.classesSummary.filter(c => c.teacherCount === 0);
    
    if (lowCoverageClasses.length > 0) {
      list.push({
        id: 'coverage',
        title: `${lowCoverageClasses.length} Classes without Teachers`,
        description: `Classes including ${lowCoverageClasses.slice(0, 2).map(c => c.name).join(', ')} have no primary faculty assigned.`,
        icon: Building,
        iconColor: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-900/20',
        severity: 'medium',
      });
    } else if (summary.classesSummary.length > 0) {
      // 2b. Positive Coverage Insight
      list.push({
        id: 'full-coverage',
        title: 'Full Teacher Coverage',
        description: `All ${summary.classesSummary.length} active classes have at least one assigned teacher.`,
        icon: Building,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/20',
        severity: 'low',
      });
    }

    // 3. General Health Insight - Only show if there's actual data but no issues
    const hasData = (summary.unassignedCount > 0) || (summary.classesSummary.length > 0) || (summary.classesSummary.some(c => c.teacherCount > 0));

    if (list.length === 0 && hasData) {
      list.push({
        id: 'healthy',
        title: 'Staffing Stable',
        description: 'All classes have assigned faculty and workload distribution is optimal.',
        icon: Users,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/20',
        severity: 'low',
      });
    }

    return list;
  }, [summary]);

  const workload = useMemo(() => {
    if (!summary || summary.classesSummary.length === 0) return 0;
    const totalAssignments = summary.classesSummary.reduce((acc, c) => acc + c.teacherCount, 0);
    const totalClasses = summary.classesSummary.length;
    // Simple heuristic: 1 teacher per class is 100% "stability". 
    // If fewer teachers than classes, it's understaffed.
    return Math.min(Math.round((totalAssignments / totalClasses) * 100), 100);
  }, [summary]);

  const getSeverityColor = (severity: StaffInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-emerald-500';
    }
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Staff Insights
          </h3>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isLoading ? '...' : (summary?.classesSummary?.reduce((acc, c) => acc + c.teacherCount, 0) || 0)} Active Faculty
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : insights.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4 transition-transform hover:scale-110">
              <Users size={32} />
            </div>
            <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              No Data Currently
            </p>
            <p className="text-xs text-slate-500 mt-2 max-w-[220px]">
              Faculty insights and workload analytics will appear once teachers are assigned to classes.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/20 bg-white/30 dark:bg-slate-800/20 backdrop-blur-md transition-all group/item"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-2xl", insight.iconBg)}>
                      <Icon className={cn("h-5 w-5", insight.iconColor)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {insight.title}
                        </h4>
                        <span className={cn(
                          "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest bg-white/50 dark:bg-slate-900/50 border border-white/20 dark:border-slate-800/50",
                          getSeverityColor(insight.severity)
                        )}>
                          {insight.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <button
                          onClick={insight.action.onClick}
                          className="text-[10px] font-black text-primary hover:tracking-widest transition-all uppercase underline-offset-4 hover:underline"
                        >
                          {insight.action.label} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workload Overview - Only show if data exists */}
      {!isLoading && insights.length > 0 && (
        <div className="mt-auto px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Faculty Density Output
                </span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">
                {workload}% Stability
              </span>
            </div>

            <ProgressBar
              value={workload}
              color={workload > 85 ? 'bg-indigo-500' : workload > 65 ? 'bg-emerald-500' : 'bg-amber-500'}
              showLabel={false}
              height="lg"
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50 text-center">
                <div className="text-emerald-500 font-black text-xs">Optimum</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Active</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50 text-center">
                <div className="text-indigo-500 font-black text-xs">Standard</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Assigned</div>
              </div>
              <div className="p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-800/50 text-center">
                <div className="text-rose-500 font-black text-xs">Peak</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Limit</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}