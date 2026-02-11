interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'green' | 'blue' | 'yellow' | 'orange' | 'red';
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  className = '',
  showLabel = false,
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-light-secondary dark:text-dark-secondary">Progress</span>
          <span className="font-medium text-text-light-primary dark:text-dark-primary">
            {value}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}