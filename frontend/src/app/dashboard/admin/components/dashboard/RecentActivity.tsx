'use client';

import { 
  CheckCircle, 
  UserPlus, 
  Database, 
  TrendingUp, 
  Bell, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Clock
} from 'lucide-react';
import { useNotifications } from '@/lib/api/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function RecentActivity({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const { data: notifications, isLoading } = useNotifications();
  const paginatedNotifications = notifications?.slice(page * itemsPerPage, (page + 1) * itemsPerPage) || [];

  const typeConfig: Record<string, { icon: any, color?: string, bg?: string, customColor?: string }> = {
    LINK_REQUEST: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    LINK_RESPONSE: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    ACADEMIC: { icon: TrendingUp, customColor: primaryColor },
    SYSTEM: { icon: Database, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
    ANNOUNCEMENT: { icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    CRITICAL: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col min-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            Recent Activity
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          </h3>
          <p className="text-xs text-slate-500">Live event stream</p>
        </div>
        <Link 
          href="/dashboard/admin/notifications"
          className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: primaryColor }}
        >
          View All <ChevronRight size={14} />
        </Link>
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <div key="loading" className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 mt-1">
                    <div className="h-3 w-3/4 rounded-full bg-slate-50 dark:bg-slate-800/50 animate-pulse" />
                    <div className="h-2 w-1/4 rounded-full bg-slate-50 dark:bg-slate-800/50 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <motion.div 
               key="empty"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="h-full flex flex-col items-center justify-center text-center py-12"
            >
               <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <Bell size={24} />
               </div>
               <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No recent activity
               </p>
               <p className="text-xs text-slate-500 mt-1">
                  Events will appear here as they occur.
               </p>
            </motion.div>
          ) : (
            <div key="list" className="space-y-3">
              {paginatedNotifications.map((notification: any, index: number) => {
                const config = typeConfig[notification.type] || typeConfig.ANNOUNCEMENT;
                const Icon = config.icon;
                
                return (
                  <motion.div 
                    key={notification.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group relative flex items-start gap-3 p-3 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                  >
                    <div 
                        className={cn(
                            "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border",
                            !config.customColor && config.bg,
                            !config.customColor && config.color,
                            !config.customColor && "dark:bg-opacity-10 dark:border-opacity-20"
                        )}
                        style={config.customColor ? { backgroundColor: `${config.customColor}15`, color: config.customColor, borderColor: `${config.customColor}30` } : {}}
                    >
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span 
                            className={cn(
                                "text-[10px] font-semibold",
                                !config.customColor && config.color
                            )}
                            style={config.customColor ? { color: config.customColor } : {}}
                        >
                            {notification.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                           <Clock size={10} />
                           {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {notification.message}
                      </p>
                    </div>

                    <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-slate-400 hover:text-slate-600 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
         </div>
         
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

