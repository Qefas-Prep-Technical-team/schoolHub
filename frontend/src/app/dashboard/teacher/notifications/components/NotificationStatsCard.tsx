import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Info, AlertCircle, Activity, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { label: 'System Alerts', count: stats.system, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Academic', count: stats.academic, icon: Activity, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Messages', count: stats.messages, icon: Mail, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Assignments', count: stats.assignments, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Device Logins', count: stats.devices, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <Card className="rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-8">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mb-4 relative">
            <Bell size={28} className="text-slate-900" />
            {stats.unread > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {stats.total}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Total Notifications
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Unread</span>
            <span className={cn(
              "text-sm font-black px-3 py-1 rounded-full",
              stats.unread > 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
            )}>
              {stats.unread}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Breakdown</p>
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", cat.bg, cat.color)}>
                    <cat.icon size={14} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{cat.label}</span>
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
