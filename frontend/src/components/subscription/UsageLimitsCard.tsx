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

export default function UsageLimitsCard({ 
  primaryColor = '#2563eb',
  title = "Usage Limits",
  description = "System unable to synchronize institutional metrics with the central conduit.",
  upgradeLink = '/dashboard/admin/billing/upgrade',
  upgradeLabel = "Upgrade Institutional capacity",
  role = 'ADMIN'
}: UsageLimitsCardProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSubscriptionUsage();
  const { data: settings, isLoading: isSettingsLoading } = usePublicPlatformSettings();

  // Check if enforcement is deactivated for this role
  const isEnforced = React.useMemo(() => {
    if (isSettingsLoading) return true; // Default to showing while loading
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
    return <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />;
  }

  if (isError || !data) {
    // ... (rest of error state stays the same)
    return (
      <Card 
        className="relative rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-10 bg-white dark:bg-slate-900/50 flex flex-col items-center justify-center gap-6 text-center min-h-[440px] transition-all overflow-hidden"
        style={{ boxShadow: `0 25px 30px -10px ${primaryColor}10` }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center border-2 border-rose-100 dark:border-rose-900/20 relative z-10">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-150 opacity-20 animate-pulse" />
        </motion.div>

        <div className="space-y-2 relative z-10">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">
            Protocol Interrupted
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-[240px] mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="group relative overflow-hidden rounded-2xl mt-4 font-black text-[10px] uppercase tracking-widest px-10 h-14 border-2 border-slate-200 dark:border-slate-800 transition-all hover:border-rose-500/50"
        >
          <span className="relative z-10 flex items-center gap-2 group-hover:text-rose-500 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            Initialize Retry Sequence
          </span>
          <div className="absolute inset-0 bg-rose-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Button>

        <div className="absolute bottom-6 flex items-center gap-2 opacity-30">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Status: Connection_Timeout</span>
        </div>
      </Card>
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
    return "";
  };

  const allMetrics = [
    { id: 'students', label: role === 'PARENT' ? "Linked Students" : "Students", count: usage.students, limit: limits.students, percent: percentages.students, color: "bg-blue-500" },
    { id: 'exams', label: role === 'STUDENT' ? "Exam Attempts" : "Exams", count: usage.exams, limit: limits.exams, percent: percentages.exams, color: "bg-primary" },
    { id: 'classes', label: "Classes", count: usage.classes, limit: limits.classes, percent: percentages.classes, color: "bg-purple-500" },
    { id: 'teachers', label: "Teachers", count: usage.teachers, limit: limits.teachers, percent: percentages.teachers, color: "bg-rose-500" },
    { id: 'storage', label: "Storage", count: `${usage.storageGb}GB`, limit: `${limits.storageGb}GB`, percent: percentages.storage, color: "bg-emerald-500" },
    { id: 'ai', label: "AI Usage", count: usage.aiUsage, limit: limits.aiUsage, percent: percentages.aiUsage, color: "bg-indigo-500" },
  ];

  // Filter metrics based on role
  const metrics = allMetrics.filter(m => {
    if (role === 'ADMIN') return true;
    if (role === 'PARENT') return ['students', 'exams', 'storage', 'ai'].includes(m.id);
    if (role === 'TEACHER') return ['exams', 'classes', 'storage'].includes(m.id);
    if (role === 'STUDENT') return ['exams', 'classes', 'storage'].includes(m.id);
    return false;
  }).concat(
    (data.planFeatures || [])
      .filter((f: any) => f.enabled && f.limit > 0)
      .map((f: any) => ({
        id: f.name,
        label: f.label,
        count: 0, 
        limit: f.limit,
        percent: 0,
        color: "bg-slate-500",
      }))
  );

  const otherFeatures = (data.planFeatures || [])
    .filter((f: any) => f.enabled && (f.limit <= 0 || !f.limit));

  const chipColors = [
    "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/30",
    "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/30",
    "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/30",
    "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/30",
    "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/30",
    "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/30",
    "bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-900/30",
  ];

  const hasWarning = Object.values(percentages).some((p: any) => p >= 80);

  return (
    <Card 
      className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 bg-white dark:bg-slate-900/50 relative overflow-hidden group transition-all"
      style={{ boxShadow: `0 20px 25px -5px ${primaryColor}15` }}
    >
      {hasWarning && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div 
            className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                hasWarning ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-blue-100 dark:bg-blue-900/20"
            )}
            style={!hasWarning ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
          >
            {hasWarning ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-slate-900 dark:text-white leading-tight">{title}</h4>
              {isTrial ? (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] h-4 px-1.5 font-black uppercase text-white border-none">Trial</Badge>
              ) : (
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-black uppercase">{subscriptionStatus}</Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase mt-0.5">Current Plan: {planName}</p>
          </div>
        </div>
        
        {hasWarning && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="hidden md:flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200/50 dark:border-amber-800/50"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-tight">Upgrade Required</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-7">
        {metrics.map((m: any, i) => (
          <div key={i} className="space-y-2.5">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-500">{m.label}</span>
              <div className="text-right">
                <span 
                    className={cn("text-base font-black tracking-tight", getTextColor(m.percent))}
                    style={m.percent < 80 ? { color: primaryColor } : {}}
                >
                  {m.count}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-1.5">
                    / {typeof m.limit === 'number' && m.limit >= 999999 ? "∞" : m.limit}
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${m.percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full shadow-lg", 
                  getBarColor(m.percent)
                )}
                style={m.percent < 80 ? { backgroundColor: primaryColor } : {}}
              />
            </div>
          </div>
        ))}

        {otherFeatures.length > 0 && (
          <div className="pt-6 border-t-2 border-slate-50 dark:border-slate-800/50 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Premium Features Locked-In</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {otherFeatures.map((f: any, i: number) => {
                const colorClass = chipColors[i % chipColors.length];
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all cursor-default",
                      colorClass
                    )}
                  >
                    {f.label}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={() => router.push(upgradeLink)}
        className={cn(
          "w-full mt-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all gap-2 group-hover:shadow-lg",
          hasWarning 
            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
            : "text-white dark:text-slate-900"
        )}
        style={!hasWarning ? { backgroundColor: primaryColor } : {}}
      >
        <span>{upgradeLabel}</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Button>
    </Card>
  );
}
