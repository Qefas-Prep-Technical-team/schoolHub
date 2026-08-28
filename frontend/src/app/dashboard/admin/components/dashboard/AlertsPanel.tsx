'use client';

import { Bell, Sparkles, ChevronRight, ChevronLeft, Info, AlertTriangle, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkAsRead } from '@/lib/api/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import Link from 'next/link';

export default function AlertsPanel({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  const { data: notifications, isLoading } = useNotifications({ 
    priority: 'HIGH' 
  });

  const paginatedNotifications = notifications?.slice(page * itemsPerPage, (page + 1) * itemsPerPage) || [];
  const { mutate: markAsRead } = useMarkAsRead();

  const getTypeStyles = (type: string, priority: string) => {
    if (priority === 'CRITICAL' || priority === 'HIGH') return 'text-rose-600 bg-rose-50 border-rose-100';
    switch (type) {
      case 'SYSTEM': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'ACADEMIC': return ''; 
      default: return 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getTypeIcon = (type: string, priority: string) => {
    if (priority === 'CRITICAL' || priority === 'HIGH') return <Zap size={14} />;
    switch (type) {
      case 'SYSTEM': return <AlertTriangle size={14} />;
      case 'ACADEMIC': return <Info size={14} />;
      default: return <Bell size={14} />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                Alerts & Notices
                {notifications && notifications.length > 0 && (
                   <span className="relative flex size-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                       <span className="relative inline-flex rounded-full size-2 bg-rose-500" />
                   </span>
                )}
            </h3>
            <p className="text-xs text-slate-500">System monitoring</p>
        </div>
        <Link 
            href="/dashboard/admin/notifications"
            className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
        >
            View All <ChevronRight size={14} />
        </Link>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div key="loading" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse h-24" />
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <motion.div 
               key="empty"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-8 flex flex-col items-center justify-center text-center"
            >
               <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <Bell size={20} />
               </div>
               <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No active alerts</p>
               <p className="text-xs text-slate-500">System is running smoothly.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {paginatedNotifications.map((notification: any, idx: number) => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={cn(
                    "group relative p-4 rounded-2xl border transition-all cursor-pointer",
                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30" : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                   <div className="flex items-start gap-3">
                      <div 
                        className={cn(
                          "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border",
                          getTypeStyles(notification.type, notification.priority)
                        )}
                        style={notification.type === 'ACADEMIC' && notification.priority !== 'HIGH' && notification.priority !== 'CRITICAL' ? { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` } : {}}
                      >
                          {getTypeIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">
                                  {notification.title}
                              </h4>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {notification.message}
                          </p>
                      </div>
                   </div>
                   {!notification.isRead && (
                     <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                   )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
         <span className="text-xs text-slate-500">{notifications?.length || 0} active</span>
         <div className="flex items-center gap-1">
            <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-7 w-7 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500 w-8 text-center">
                {page + 1}/{Math.max(1, Math.ceil((notifications?.length || 0) / itemsPerPage))}
            </span>
            <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!notifications || (page + 1) * itemsPerPage >= notifications.length}
                className="h-7 w-7 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
            >
                <ChevronRight size={16} />
            </button>
         </div>
      </div>
    </div>
  );
}

