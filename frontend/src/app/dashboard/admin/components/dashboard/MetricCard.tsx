import { LucideIcon, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  badge,
  badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  onClick,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden group p-5 rounded-[2.5rem] transition-all cursor-pointer',
        'bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl',
        'border border-white/20 dark:border-slate-800/50',
        'shadow-xl shadow-slate-200/30 dark:shadow-none'
      )}
    >
      {/* Internal Glow */}
      <div className={cn(
        'absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500',
        iconBg.replace('bg-', 'bg-').split(' ')[0] // Try to extract bg color
      )} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn(
          'h-12 w-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500',
          'bg-white/50 dark:bg-slate-800/50 shadow-sm border border-white/20 dark:border-slate-700/50',
          iconColor,
          'group-hover:rotate-12 group-hover:scale-110'
        )}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        
        {trend ? (
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500',
            trend.isPositive
              ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10'
              : 'text-rose-600 bg-rose-500/5 border-rose-500/10'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 shadow-emerald-500/50" />
            ) : (
              <TrendingDown className="h-3 w-3 shadow-rose-500/50" />
            )}
            {trend.value}
          </div>
        ) : badge ? (
          <div className={cn(
            'text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest',
            badgeColor
          )}>
            {badge}
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center">
            <Sparkles size={12} className="text-slate-400 opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-primary transition-colors">
          {title}
        </p>
        
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            {value}
          </h3>
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Decorative Wave logic or line */}
      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
         <div className={cn(
            "h-full w-0 group-hover:w-full transition-all duration-700 rounded-full",
            "bg-gradient-to-r from-transparent via-primary/30 to-transparent"
         )} />
      </div>
    </motion.div>
  );
}