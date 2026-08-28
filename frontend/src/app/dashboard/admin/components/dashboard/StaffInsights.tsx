'use client';

import { Users, UserX, Building, AlertTriangle, TrendingUp, TrendingDown, Landmark, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import ProgressBar from './ui/ProgressBar';
import { useSchoolDashboardSummary } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StaffInsight {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  severity: 'high' | 'medium' | 'low';
  customColor?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function StaffInsights({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const { data: summary, isLoading } = useSchoolDashboardSummary(schoolId);

  const insights = useMemo<StaffInsight[]>(() => {
    if (!summary) return [];

    const list: StaffInsight[] = [];

    if (summary.unassignedCount > 0) {
      list.push({
        id: 'unassigned',
        title: `${summary.unassignedCount} Unassigned Teachers`,
        description: `Personnel like ${summary.unassignedTeachers.map(t => t.name).join(', ')} are awaiting class assignment.`,
        icon: UserX,
        iconColor: 'text-rose-600',
        iconBg: 'bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30',
        severity: 'high',
        action: {
          label: 'Assign Now',
          onClick: () => console.log('Assign teachers'),
        },
      });
    }

    const lowCoverageClasses = summary.classesSummary.filter(c => c.teacherCount === 0);

    if (lowCoverageClasses.length > 0) {
      list.push({
        id: 'coverage',
        title: `${lowCoverageClasses.length} Unassigned Classes`,
        description: `Classes including ${lowCoverageClasses.slice(0, 2).map(c => c.name).join(', ')} have no primary teacher assigned.`,
        icon: Building,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30',
        severity: 'medium',
      });
    } else if (summary.classesSummary.length > 0) {
      list.push({
        id: 'full-coverage',
        title: 'Full Teacher Coverage',
        description: `All ${summary.classesSummary.length} classes have verified teacher assignment.`,
        icon: Building,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30',
        severity: 'low',
      });
    }

    const hasData = (summary.unassignedCount > 0) || (summary.classesSummary.length > 0) || (summary.classesSummary.some(c => c.teacherCount > 0));

    if (list.length === 0 && hasData) {
      list.push({
        id: 'healthy',
        title: 'Staffing Stable',
        description: 'All classes are currently balanced with optimal workload distribution.',
        icon: Users,
        iconColor: 'text-primary',
        iconBg: 'bg-primary/10',
        severity: 'low',
        customColor: primaryColor
      });
    }

    return list;
  }, [summary, primaryColor]);

  const workload = useMemo(() => {
    if (!summary || summary.classesSummary.length === 0) return 0;
    const totalAssignments = summary.classesSummary.reduce((acc, c) => acc + c.teacherCount, 0);
    const totalClasses = summary.classesSummary.length;
    return Math.min(Math.round((totalAssignments / totalClasses) * 100), 100);
  }, [summary]);

  const getSeverityStyles = (severity: StaffInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      
      <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            Teacher Updates
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          </h3>
          <p className="text-xs text-slate-500">Staff overview and insights</p>
        </div>
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
          <Users size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : insights.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-3">
              <Users size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No updates currently</p>
            <p className="text-xs text-slate-500">
              Teacher updates will appear once assignments are made.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight: any, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3"
                >
                  <div
                    className={cn("p-2.5 rounded-xl shrink-0 border", !insight.customColor && insight.iconBg)}
                    style={insight.customColor ? { backgroundColor: `${insight.customColor}15`, color: insight.customColor, borderColor: `${insight.customColor}30` } : {}}
                  >
                    <Icon className={cn("h-5 w-5", !insight.customColor && insight.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {insight.title}
                      </h4>
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                        getSeverityStyles(insight.severity)
                      )}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <button
                        onClick={insight.action.onClick}
                        className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: primaryColor }}
                      >
                        {insight.action.label} <TrendingUp size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && insights.length > 0 && (
        <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500 flex items-center gap-1">
               <Sparkles className="h-3 w-3" style={{ color: primaryColor }} />
               Staff Status
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {workload}% Optimal
            </span>
          </div>

          <ProgressBar
            value={workload}
            color={workload > 85 ? '' : workload > 65 ? 'bg-emerald-500' : 'bg-amber-500'}
            style={workload > 85 ? { backgroundColor: primaryColor } : {}}
            showLabel={false}
            height="lg"
          />

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
              <div className="font-semibold text-sm" style={{ color: primaryColor }}>98.2%</div>
              <div className="text-[10px] text-slate-500">Uptime</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
              <div className="font-semibold text-sm" style={{ color: primaryColor }}>{summary?.classesSummary?.reduce((acc, c) => acc + c.teacherCount, 0) || 0}</div>
              <div className="text-[10px] text-slate-500">Active</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
              <div className="font-semibold text-sm" style={{ color: primaryColor }}>{summary?.classesSummary.length || 0}</div>
              <div className="text-[10px] text-slate-500">Units</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

