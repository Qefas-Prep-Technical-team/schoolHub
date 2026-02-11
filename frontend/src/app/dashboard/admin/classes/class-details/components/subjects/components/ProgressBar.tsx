import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max = 100, 
  color = 'primary',
  showLabel = true,
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
            Class Performance
          </span>
          <span className="text-primary text-sm font-bold">
            {value}%
          </span>
        </div>
      )}
      <div className={`rounded-full bg-primary/20 dark:bg-primary/30 ${sizeClasses[size]}`}>
        <div 
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;