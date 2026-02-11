'use client';

import { Bell } from 'lucide-react';
import AlertItem from './ui/AlertItem';

export default function AlertsPanel() {
  const alerts = [
    {
      id: '1',
      title: 'System Maintenance',
      description: 'Server downtime scheduled for 10 PM tonight.',
      type: 'urgent' as const,
      time: 'Today',
      actions: ['VIEW DETAILS'],
    },
    {
      id: '2',
      title: 'Missing Results',
      description: 'Grade 9 Chemistry results not uploaded by deadline.',
      type: 'warning' as const,
      time: '2h ago',
      actions: ['REMIND TEACHER'],
    },
    {
      id: '3',
      title: 'PTA Meeting',
      description: 'Agenda finalized. Notification sent to parents.',
      type: 'info' as const,
      time: 'Fri, 28th',
    },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <span className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-3 bg-red-500" />
          </span>
          Alerts & Notices
        </h3>
        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
          3 URGENT
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} {...alert} />
        ))}
      </div>
    </div>
  );
}