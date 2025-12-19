import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  value,
  maxValue = 100,
  color = 'bg-primary',
  showLabel = true,
  labelPosition = 'outside',
  height = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span>{value}/{maxValue} ({percentage.toFixed(0)}%)</span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden',
        heightClasses[height]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            color
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === 'inside' && (
            <span className="absolute right-2 text-xs font-bold text-white mix-blend-difference">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}