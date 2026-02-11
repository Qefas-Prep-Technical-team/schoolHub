import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
        {title}
      </p>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-primary text-xs font-bold uppercase tracking-wide hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}