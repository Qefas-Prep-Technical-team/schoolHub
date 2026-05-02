'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';

export default function UsageLimitsCard({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSubscriptionUsage();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />;
  }

  if (isError || !data) {
    return (
      <Card 
        className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 bg-white dark:bg-slate-900/50 flex flex-col items-center justify-center gap-4 text-center min-h-[400px] transition-all"
        style={{ boxShadow: `0 20px 25px -5px ${primaryColor}15` }}
      >
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-slate-900 dark:text-white">Connection Issues</h4>
          <p className="text-sm text-slate-500 font-medium">We couldn't load your usage limits right now.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="rounded-full mt-2 font-bold px-8 border-slate-200"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  const { usage, limits, percentages, planName, subscriptionStatus, isTrial } = data;

  const displayPlanName = planName;

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-rose-500";
    if (percentage >= 80) return "bg-amber-500";
    return ""; // Will use inline style for primaryColor
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return "text-rose-600 dark:text-rose-400";
    if (percentage >= 80) return "text-amber-600 dark:text-amber-400";
    return ""; // Will use inline style
  };

  const metrics = [
    { label: "Students", count: usage.students, limit: limits.students, percent: percentages.students, color: "bg-blue-500" },
    { label: "Exams", count: usage.exams, limit: limits.exams, percent: percentages.exams, color: "bg-primary" },
    { label: "Classes", count: usage.classes, limit: limits.classes, percent: percentages.classes, color: "bg-purple-500" },
    { label: "Teachers", count: usage.teachers, limit: limits.teachers, percent: percentages.teachers, color: "bg-rose-500" },
    { label: "Storage", count: `${usage.storageGb}GB`, limit: `${limits.storageGb}GB`, percent: percentages.storage, color: "bg-emerald-500" },
  ];

  const hasWarning = Object.values(percentages).some(p => p >= 80);

  return (
    <Card 
      className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 bg-white dark:bg-slate-900/50 relative overflow-hidden group transition-all"
      style={{ boxShadow: `0 20px 25px -5px ${primaryColor}15` }}
    >
      {/* Background Glow when nearing limits */}
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
              <h4 className="font-black text-slate-900 dark:text-white leading-tight">Usage Limits</h4>
              {isTrial ? (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] h-4 px-1.5 font-black uppercase text-white border-none">Trial</Badge>
              ) : (
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-black uppercase">{subscriptionStatus}</Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase mt-0.5">Current Plan: {displayPlanName}</p>
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
        {metrics.map((m, i) => (
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
                className={cn("h-full rounded-full shadow-lg", getBarColor(m.percent))}
                style={m.percent < 80 ? { backgroundColor: primaryColor } : {}}
              />
            </div>
          </div>
        ))}
      </div>

      <Button 
        onClick={() => router.push('/dashboard/admin/billing/upgrade')}
        className={cn(
          "w-full mt-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all gap-2 group-hover:shadow-lg",
          hasWarning 
            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
            : "text-white dark:text-slate-900"
        )}
        style={!hasWarning ? { backgroundColor: primaryColor } : {}}
      >
        <span>Upgrade Institutional capacity</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Button>
    </Card>
  );
}

