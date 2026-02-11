import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  type: 'unread' | 'important' | 'updated' | 'expiring';
  className?: string;
}

const statusConfig = {
  unread: {
    label: 'Unread',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    dotColor: 'bg-blue-500',
  },
  important: {
    label: 'Important',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  updated: {
    label: 'Updated',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    dotColor: 'bg-green-500',
  },
  expiring: {
    label: 'Expiring',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    dotColor: 'bg-red-500',
  },
};

export default function StatusBadge({ type, className = '' }: StatusBadgeProps) {
  const config = statusConfig[type];

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', config.className, className)}>
      <div className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </div>
  );
}