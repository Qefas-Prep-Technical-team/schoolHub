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
        title: `${summary.unassignedCount} Unassigned Faculty`,
        description: `Personnel like ${summary.unassignedTeachers.map(t => t.name).join(', ')} are awaiting class assignment.`,
        icon: UserX,
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-500/10',
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
        description: `Classes including ${lowCoverageClasses.slice(0, 2).map(c => c.name).join(', ')} have no primary faculty assigned.`,
        icon: Building,
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-500/10',
        severity: 'medium',
      });
    } else if (summary.classesSummary.length > 0) {
      list.push({
        id: 'full-coverage',
        title: 'Full Faculty Coverage',
        description: `All ${summary.classesSummary.length} classes have verified faculty assignment.`,
        icon: Building,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10',
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
      case 'high': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  return (
    <div
      className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/20 dark:border-slate-800/50 overflow-hidden flex flex-col group transition-all"
      style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
    >
      <div
        className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="px-10 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>Personnel Metrics</span>
            </div>
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter italic uppercase">
              Faculty Insights
            </h3>
          </div>
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white dark:text-slate-900 group-hover:scale-110 transition-transform" style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar relative z-10">
        {isLoading ? (
          <div className="space-y-4 px-4">
            <Skeleton className="h-24 w-full rounded-[2rem]" />
            <Skeleton className="h-24 w-full rounded-[2rem]" />
          </div>
        ) : insights.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-3">
              <Users size={24} />
            </div>
            <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none mb-2">No data available currently</p>
            <p className="text-[10px] text-slate-500 font-bold italic max-w-[250px]">
              Faculty insights will appear once teachers are assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-3 px-2">
            {insights.map((insight: any, idx) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 rounded-[2.5rem] border border-transparent bg-white/30 dark:bg-slate-800/20 backdrop-blur-md transition-all group/item"
                  style={{ '--hover-border': `${primaryColor}20` } as any}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn("p-3 rounded-2xl shrink-0 group-hover/item:scale-110 transition-transform", !insight.customColor && insight.iconBg)}
                      style={insight.customColor ? { backgroundColor: `${insight.customColor}15`, color: insight.customColor } : {}}
                    >
                      <Icon className={cn("h-6 w-6", !insight.customColor && insight.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic truncate pr-2">
                          {insight.title}
                        </h4>
                        <span className={cn(
                          "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shrink-0",
                          getSeverityStyles(insight.severity)
                        )}>
                          {insight.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-3 italic">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <button
                          onClick={insight.action.onClick}
                          className="text-[10px] font-black hover:tracking-widest transition-all uppercase flex items-center gap-1"
                          style={{ color: primaryColor }}
                        >
                          View Details <TrendingUp size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workload Overview - Only show if data exists */}
      {!isLoading && insights.length > 0 && (
        <div className="mt-auto px-10 py-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Staffing Stability
                </span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter italic">
                {workload}% STABLE
              </span>
            </div>

            <ProgressBar
              value={workload}
              color={workload > 85 ? '' : workload > 65 ? 'bg-emerald-500' : 'bg-amber-500'}
              style={workload > 85 ? { backgroundColor: primaryColor } : {}}
              showLabel={false}
              height="lg"
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center group/sub">
                <div className="font-black text-sm tracking-tighter italic group-hover/sub:scale-110 transition-transform" style={{ color: primaryColor }}>98.2%</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Uptime</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center group/sub">
                <div className="font-black text-sm tracking-tighter italic group-hover/sub:scale-110 transition-transform" style={{ color: primaryColor }}>{summary?.classesSummary?.reduce((acc, c) => acc + c.teacherCount, 0) || 0}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center group/sub">
                <div className="font-black text-sm tracking-tighter italic group-hover/sub:scale-110 transition-transform" style={{ color: primaryColor }}>{summary?.classesSummary.length || 0}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Units</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

