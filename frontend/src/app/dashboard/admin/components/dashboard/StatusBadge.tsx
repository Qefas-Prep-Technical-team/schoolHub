import { cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'warning' | 'error' | 'success';
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = {
    active: {
      icon: CheckCircle,
      colors: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      iconColors: 'text-blue-600 dark:text-blue-400',
    },
    pending: {
      icon: Clock,
      colors: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      iconColors: 'text-amber-600 dark:text-amber-400',
    },
    warning: {
      icon: AlertCircle,
      colors: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      iconColors: 'text-orange-600 dark:text-orange-400',
    },
    error: {
      icon: XCircle,
      colors: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      iconColors: 'text-red-600 dark:text-red-400',
    },
    success: {
      icon: CheckCircle,
      colors: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      iconColors: 'text-emerald-600 dark:text-emerald-400',
    },
  };

  const { icon: Icon, colors, iconColors } = config[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      colors,
      sizeClasses[size]
    )}>
      <Icon className={cn(iconColors, iconSize[size])} />
      {label}
    </span>
  );
}