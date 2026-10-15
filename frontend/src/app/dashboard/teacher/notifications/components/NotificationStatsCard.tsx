'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Info, AlertCircle, Activity, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface NotificationStats {
  total: number;
  unread: number;
  linkRequests: number;
  system: number;
  academic: number;
  messages: number;
  assignments: number;
  devices: number;
}

interface NotificationStatsCardProps {
  stats: NotificationStats;
}

export function NotificationStatsCard({ stats }: NotificationStatsCardProps) {
  const categories = [
    { label: 'Link Requests', count: stats.linkRequests, icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'System Alerts', count: stats.system, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Academic', count: stats.academic, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Messages', count: stats.messages, icon: Mail, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Assignments', count: stats.assignments, icon: Activity, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Device Logins', count: stats.devices, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-emerald-800/40 shadow-sm bg-white dark:bg-emerald-950/30 backdrop-blur-xl lg:sticky lg:top-8">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center mb-3 relative text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Bell size={26} />
            {stats.unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </h3>
            <HeaderTooltip
              content="Total count of recorded notifications and alerts currently logged in your teacher feed."
              size={13}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Total Notifications
          </p>
        </div>

        <div className="space-y-3.5">
          {/* Unread Pill */}
          <div className="flex justify-between items-center p-3 sm:p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Unread Alerts</span>
            <span
              className={cn(
                "text-xs font-black px-2.5 py-0.5 rounded-lg",
                stats.unread > 0
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-slate-400"
              )}
            >
              {stats.unread}
            </span>
          </div>

          {/* Breakdown Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Category Breakdown
              </p>
              <HeaderTooltip
                content="Categorical segmentation of alerts based on system type, linking requests, and academic updates."
                size={11}
              />
            </div>
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", cat.bg, cat.color)}>
                    <cat.icon size={13} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{cat.label}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
