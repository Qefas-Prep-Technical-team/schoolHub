import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
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
  badgeColor = 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  onClick,
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group',
        onClick && 'hover:border-primary/20 hover:scale-[1.02]'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'p-2 rounded-lg transition-all duration-300',
          iconBg,
          iconColor,
          'group-hover:scale-110 group-hover:shadow-sm'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        {trend ? (
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
            trend.isPositive
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        ) : badge ? (
          <span className={cn(
            'text-xs font-bold px-2 py-1 rounded border',
            badgeColor
          )}>
            {badge}
          </span>
        ) : null}
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
        {title}
      </p>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </h3>

      {/* Hover effect line */}
      <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-primary/20 transition-all duration-300 rounded-full" />
    </div>
  );
}