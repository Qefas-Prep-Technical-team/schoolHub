'use client';

import React from 'react';
import { Bell, CheckCircle2, Link2, AlertCircle, Megaphone, Clock, TrendingUp, BookOpen, Smartphone, Mail } from 'lucide-react';
import { Notification } from '@/lib/api/services/notificationService';
import { cn } from '@/lib/utils';

interface NotificationAnalyticsCardProps {
  notifications: Notification[];
}

export default function NotificationAnalyticsCard({ notifications }: NotificationAnalyticsCardProps) {
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const read = total - unread;

  const byType = notifications.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  const typeStats = [
    {
      label: 'Requests',
      count: (byType['LINK_REQUEST'] || 0) + (byType['LINK_ACCEPTED'] || 0) + (byType['LINK_REJECTED'] || 0) + (byType['LINK_RESPONSE'] || 0),
      icon: <Link2 size={12} />,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'System',
      count: byType['SYSTEM'] || 0,
      icon: <AlertCircle size={12} />,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: 'Announcements',
      count: byType['ANNOUNCEMENT'] || 0,
      icon: <Megaphone size={12} />,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: 'Academic',
      count: byType['ACADEMIC'] || 0,
      icon: <TrendingUp size={12} />,
      color: 'text-green-500 bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Assessments',
      count: notifications.filter(n => n.title?.includes('Assignment') || n.title?.includes('Assessment')).length,
      icon: <BookOpen size={12} />,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      label: 'Website Inquiries',
      count: notifications.filter(n => n.type === 'GENERAL' && n.title === 'New Website Inquiry').length,
      icon: <Mail size={12} />,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
    },
    {
      label: 'Messages',
      count: byType['MESSAGE'] || 0,
      icon: <Mail size={12} />,
      color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30',
    },
    {
      label: 'Devices',
      count: notifications.filter(n => n.title?.includes('Device Login')).length,
      icon: <Smartphone size={12} />,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
    },
  ].filter((s) => s.count > 0);

  const now = Date.now();
  const last7Days = notifications.filter((n) => now - new Date(n.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const readPercent = total > 0 ? Math.round((read / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden sticky top-24">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bell size={12} className="text-primary" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">
            Analytics
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Read Rate</span>
            <span className="text-xs font-black text-primary">{readPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${readPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{total}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Total</p>
          </div>
          <div className={cn(
            "rounded-xl p-3 text-center",
            unread > 0 ? "bg-primary/5" : "bg-gray-50 dark:bg-gray-900"
          )}>
            <p className={cn("text-xl font-black leading-none", unread > 0 ? "text-primary" : "text-gray-900 dark:text-white")}>{unread}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Unread</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last 7 days</span>
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{last7Days}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={11} className="text-green-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Read</span>
            </div>
            <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">{read}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Unread</span>
            </div>
            <span className="text-[11px] font-black text-primary">{unread}</span>
          </div>
        </div>

        {typeStats.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">By Type</p>
            {typeStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn("w-5 h-5 rounded-md flex items-center justify-center", stat.color)}>
                    {stat.icon}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">{stat.label}</span>
                </div>
                <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">{stat.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
