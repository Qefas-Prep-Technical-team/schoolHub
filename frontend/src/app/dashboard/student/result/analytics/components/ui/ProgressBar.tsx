interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'gray' | 'green' | 'amber' | 'red';
  variant?: 'solid' | 'light';
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  className = '',
  color = 'primary',
  variant = 'solid'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    primary: variant === 'solid' ? 'bg-primary' : 'bg-primary/20 dark:bg-primary/30',
    gray: variant === 'solid' ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-200 dark:bg-gray-700',
    green: variant === 'solid' ? 'bg-green-600' : 'bg-green-100 dark:bg-green-900/50',
    amber: variant === 'solid' ? 'bg-amber-600' : 'bg-amber-100 dark:bg-amber-900/50',
    red: variant === 'solid' ? 'bg-red-600' : 'bg-red-100 dark:bg-red-900/50',
  };

  return (
    <div className={`w-full rounded-full h-2.5 ${className}`}>
      <div
        className={`h-2.5 rounded-full ${colorClasses[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}