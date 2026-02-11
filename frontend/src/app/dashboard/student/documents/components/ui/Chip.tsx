'use client';

import { cn } from '@/lib/utils';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  count?: number;
  className?: string;
}

export function Chip({ children, active = false, onClick, count, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-9 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-white shadow-sm'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20',
        className
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn(
          'ml-2 px-1.5 py-0.5 rounded text-xs font-medium',
          active
            ? 'bg-white/20'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}