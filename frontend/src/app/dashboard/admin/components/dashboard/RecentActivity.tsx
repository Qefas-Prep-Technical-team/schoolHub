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

const typeConfig: Record<string, { icon: any, color: string, bg: string }> = {
  LINK_REQUEST: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  LINK_RESPONSE: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ACADEMIC: { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  SYSTEM: { icon: Database, color: 'text-slate-500', bg: 'bg-slate-500/10' },
  ANNOUNCEMENT: { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  CRITICAL: { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
};

export default function RecentActivity({ primaryColor = '#2563eb' }: { primaryColor?: string }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const { data: notifications, isLoading } = useNotifications();
  const paginatedNotifications = notifications?.slice(page * itemsPerPage, (page + 1) * itemsPerPage) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const typeConfig: Record<string, { icon: any, color?: string, bg?: string, customColor?: string }> = {
    LINK_REQUEST: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    LINK_RESPONSE: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ACADEMIC: { icon: TrendingUp, customColor: primaryColor },
    SYSTEM: { icon: Database, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    ANNOUNCEMENT: { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    CRITICAL: { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "relative overflow-hidden group min-h-[750px] flex flex-col",
        "bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl",
        "rounded-[3rem] border border-white/20 dark:border-slate-800/50",
        "p-8 md:p-10 transition-all duration-500"
      )}
      style={{ 
        boxShadow: `0 25px 50px -12px ${primaryColor}15`,
        '--shadow-color': `${primaryColor}05` 
      } as any}
    >
      {/* Background Decor */}
      <div 
        className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-100" 
        style={{ backgroundColor: primaryColor }}
      />

      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>Institutional Pulse</span>
          </div>
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
            Recent Activity
          </h3>
        </div>
        <Link 
          href="/dashboard/admin/notifications"
          className="h-10 px-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center gap-2 group/btn"
          style={{ '--hover-color': primaryColor } as any}
        >
          View All
          <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="flex-1 space-y-4 relative z-10 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <div key="loading" className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-1/4 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <motion.div 
               key="empty"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="h-full flex flex-col items-center justify-center p-10 text-center gap-4 py-20"
            >
               <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300">
                  <Bell size={32} />
               </div>
               <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  Static Baseline
               </p>
               <p className="text-xs text-slate-500 font-bold">
                  No institutional events captured in the last cycle.
               </p>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-2">
              {paginatedNotifications.map((notification: any) => {
                const config = typeConfig[notification.type] || typeConfig.ANNOUNCEMENT;
                const Icon = config.icon;
                
                return (
                  <motion.div 
                    key={notification.id}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    className="group/item relative flex items-start gap-4 p-4 rounded-[2.5rem] border border-white/10 dark:border-slate-800/30 bg-white/30 dark:bg-slate-800/20 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                    style={{ '--hover-border': `${primaryColor}20` } as any}
                  >
                    <div 
                        className={cn(
                            "flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 scale-95 group-hover/item:scale-100",
                            !config.customColor && config.bg,
                            !config.customColor && config.color
                        )}
                        style={config.customColor ? { backgroundColor: `${config.customColor}15`, color: config.customColor } : {}}
                    >
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span 
                            className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-current opacity-60",
                                !config.customColor && config.color
                            )}
                            style={config.customColor ? { color: config.customColor, borderColor: config.customColor } : {}}
                        >
                            {notification.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                           <Clock size={10} strokeWidth={3} />
                           {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold truncate line-clamp-1 mt-0.5 opacity-80 group-hover/item:opacity-100 transition-opacity">
                        {notification.message}
                      </p>
                    </div>

                    <div className="absolute right-4 bottom-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-slate-300 hover:text-white transition-colors" style={{ '--hover-color': primaryColor } as any} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-8 pt-6 border-t border-slate-200/30 dark:border-slate-800/50 relative z-10">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="hidden sm:block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live Activity Monitor</p>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-6 w-6 rounded-md bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={12} />
                </button>
                <span className="text-[10px] font-black text-slate-500">
                    {page + 1} / {Math.max(1, Math.ceil((notifications?.length || 0) / itemsPerPage))}
                </span>
                <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={!notifications || (page + 1) * itemsPerPage >= notifications.length}
                    className="h-6 w-6 rounded-md bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={12} />
                </button>
            </div>

            <Link href="/dashboard/admin/notifications" className="text-[10px] font-black hover:tracking-[0.15em] transition-all uppercase" style={{ color: primaryColor }}>
               Configure Filters
            </Link>
         </div>
      </div>
    </motion.div>
  );
}

