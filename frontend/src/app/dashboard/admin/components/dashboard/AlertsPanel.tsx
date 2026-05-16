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
    priority: 'HIGH' // Focus on high-priority institutional alerts
  });

  const paginatedNotifications = notifications?.slice(page * itemsPerPage, (page + 1) * itemsPerPage) || [];

  const { mutate: markAsRead } = useMarkAsRead();

  const getTypeStyles = (type: string, priority: string) => {
    if (priority === 'CRITICAL' || priority === 'HIGH') return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    switch (type) {
      case 'SYSTEM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'ACADEMIC': return ''; // Will use primaryColor
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
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
    <div 
      className="bg-white/40 dark:bg-slate-950/60 backdrop-blur-3xl rounded-[3rem] border border-white/20 dark:border-slate-800/50 p-10 flex-1 relative group overflow-hidden flex flex-col transition-all"
      style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
    >
      <div 
        className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" 
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
                <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-rose-500" />
                </span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em]">Recent Alerts</span>
            </div>
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter italic uppercase">
                Alerts & Notices
            </h3>
        </div>
        <div className="flex items-center gap-3">
            <span 
                className="border text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm hidden md:inline-block"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}20` }}
            >
              {isLoading ? '...' : (notifications?.length || 0)} ACTIVE
            </span>
            <Link 
              href="/dashboard/admin/notifications"
              className="h-10 px-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center gap-2 group/btn"
              style={{ '--hover-color': primaryColor } as any}
            >
              View All
              <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
      
      <div className="space-y-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div key="loading" className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 animate-pulse h-32" />
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <motion.div 
               key="empty"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-10 flex flex-col items-center justify-center text-center px-4"
            >
               <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-3">
                  <Bell size={24} />
               </div>
               <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none mb-2">No data available currently</p>
               <p className="text-[10px] text-slate-500 font-bold italic max-w-[250px]">
                 Notifications will appear here as they occur.
               </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {paginatedNotifications.map((notification: any, idx: number) => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={cn(
                    "group/item relative p-6 rounded-[2.5rem] bg-white/30 dark:bg-slate-800/20 border border-transparent transition-all cursor-pointer",
                    !notification.isRead && "border-white/20"
                  )}
                  style={!notification.isRead ? { backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` } : {}}
                >
                   <div className="flex items-start gap-5">
                      <div 
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover/item:scale-110",
                          getTypeStyles(notification.type, notification.priority)
                        )}
                        style={notification.type === 'ACADEMIC' && notification.priority !== 'HIGH' && notification.priority !== 'CRITICAL' ? { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` } : {}}
                      >
                          {getTypeIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic truncate pr-2">
                                  {notification.title}
                              </h4>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-3">
                              {notification.message}
                          </p>
                          <div className="flex gap-3">
                              <button 
                                  className="text-[9px] font-black hover:tracking-widest uppercase flex items-center gap-1 transition-all hover:gap-2"
                                  style={{ color: primaryColor }}
                              >
                                  VIEW ALERT <ChevronRight size={10} />
                              </button>
                          </div>
                      </div>
                   </div>
                   {!notification.isRead && (
                     <div className="absolute top-4 right-4 h-2 w-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ backgroundColor: primaryColor }} />
                   )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Visual Decor */}
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 relative z-10 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: primaryColor }} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Monitoring</p>
         </div>
         <div className="flex items-center gap-2">
            <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 w-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black text-slate-500">
                {page + 1} / {Math.max(1, Math.ceil((notifications?.length || 0) / itemsPerPage))}
            </span>
            <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!notifications || (page + 1) * itemsPerPage >= notifications.length}
                className="h-8 w-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
         </div>
      </div>
    </div>
  );
}

