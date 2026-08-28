'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { usePublicPlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';

interface UsageLimitsCardProps {
  primaryColor?: string;
  title?: string;
  description?: string;
  upgradeLink?: string;
  upgradeLabel?: string;
  role?: 'ADMIN' | 'PARENT' | 'TEACHER' | 'STUDENT';
}

interface PlanFeature {
  name: string;
  label: string;
  enabled: boolean;
  limit: number;
}

interface Metric {
  id: string;
  label: string;
  count: number | string;
  limit: number | string;
  percent: number;
  color: string;
}

export default function UsageLimitsCard({ 
  primaryColor = '#2563eb',
  title = "Usage Limits",
  description = "System unable to synchronize institutional metrics with the central conduit.",
  upgradeLink = '/dashboard/admin/billing/upgrade',
  upgradeLabel = "Upgrade Plan",
  role = 'ADMIN'
}: UsageLimitsCardProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSubscriptionUsage();
  const { data: settings, isLoading: isSettingsLoading } = usePublicPlatformSettings();

  const isEnforced = React.useMemo(() => {
    if (isSettingsLoading) return true;
    if (!settings) return true;

    switch (role) {
      case 'ADMIN': return settings.sub_enforced_schools !== "false";
      case 'PARENT': return settings.sub_enforced_parents !== "false";
      case 'TEACHER': return settings.sub_enforced_teachers !== "false";
      case 'STUDENT': return settings.sub_enforced_students !== "false";
      default: return true;
    }
  }, [settings, isSettingsLoading, role]);

  if (!isEnforced) return null;

  if (isLoading || isSettingsLoading) {
    return <Skeleton className="h-[400px] w-full rounded-3xl" />;
  }

  if (isError || !data) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center gap-4 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-rose-500 mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
            Connection Error
          </h4>
          <p className="text-sm text-slate-500 max-w-[240px] mx-auto">
            {description}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="mt-4 rounded-xl text-xs font-semibold"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const { usage, limits, percentages, planName, subscriptionStatus, isTrial } = data;

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-rose-500";
    if (percentage >= 80) return "bg-amber-500";
    return "";
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return "text-rose-600 dark:text-rose-400";
    if (percentage >= 80) return "text-amber-600 dark:text-amber-400";
    return "text-slate-800 dark:text-white";
  };

  const allMetrics = [
    { id: 'students', label: role === 'PARENT' ? "Linked Students" : "Students", count: usage.students, limit: limits.students, percent: percentages.students, color: "bg-blue-500" },
    { id: 'exams', label: role === 'STUDENT' ? "Exam Attempts" : "Exams", count: usage.exams, limit: limits.exams, percent: percentages.exams, color: "bg-primary" },
    { id: 'classes', label: "Classes", count: usage.classes, limit: limits.classes, percent: percentages.classes, color: "bg-purple-500" },
    { id: 'teachers', label: "Teachers", count: usage.teachers, limit: limits.teachers, percent: percentages.teachers, color: "bg-rose-500" },
    { id: 'storage', label: "Storage", count: `${usage.storageGb}GB`, limit: `${limits.storageGb}GB`, percent: percentages.storage, color: "bg-emerald-500" },
    { id: 'ai', label: "AI Usage", count: usage.aiUsage, limit: limits.aiUsage, percent: percentages.aiUsage, color: "bg-indigo-500" },
  ];

  const metrics: Metric[] = allMetrics.filter(m => {
    if (role === 'ADMIN') return true;
    if (role === 'PARENT') return ['students', 'exams', 'storage', 'ai'].includes(m.id);
    if (role === 'TEACHER') return ['exams', 'classes', 'storage'].includes(m.id);
    if (role === 'STUDENT') return ['exams', 'classes', 'storage'].includes(m.id);
    return false;
  }).concat(
    ((data.planFeatures as PlanFeature[]) || [])
      .filter((f) => f.enabled && f.limit > 0)
      .map((f) => ({
        id: f.name,
        label: f.label,
        count: 0, 
        limit: f.limit,
        percent: 0,
        color: "bg-slate-500",
      }))
  );

  const otherFeatures = ((data.planFeatures as PlanFeature[]) || [])
    .filter((f) => f.enabled && (f.limit <= 0 || !f.limit));

  const hasWarning = Object.values(percentages).some((p) => (p as number) >= 80);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                hasWarning ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" : "bg-slate-50 text-slate-500 dark:bg-slate-800"
            )}
            style={!hasWarning ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
          >
            {hasWarning ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-800 dark:text-white leading-tight flex items-center gap-2">
              {title}
              {isTrial ? (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] h-4 px-1.5 font-bold uppercase text-white border-none">Trial</Badge>
              ) : (
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold uppercase">{subscriptionStatus}</Badge>
              )}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Plan: {planName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{m.label}</span>
              <div className="text-right">
                <span className={cn("text-sm font-semibold", getTextColor(m.percent))}>
                  {m.count}
                </span>
                <span className="text-xs text-slate-400 ml-1">
                    / {typeof m.limit === 'number' && m.limit >= 999999 ? "∞" : m.limit}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${m.percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full", 
                  getBarColor(m.percent)
                )}
                style={m.percent < 80 ? { backgroundColor: primaryColor } : {}}
              />
            </div>
          </div>
        ))}

        {otherFeatures.length > 0 && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <h5 className="text-xs font-semibold text-slate-500 mb-3">Included Features</h5>
            <div className="flex flex-wrap gap-2">
              {otherFeatures.map((f, i: number) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={() => router.push(upgradeLink)}
        className={cn(
          "w-full mt-6 h-10 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5",
          hasWarning 
            ? "bg-amber-500 hover:bg-amber-600 text-white" 
            : "text-white dark:text-slate-900"
        )}
        style={!hasWarning ? { backgroundColor: primaryColor } : {}}
      >
        {upgradeLabel}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
