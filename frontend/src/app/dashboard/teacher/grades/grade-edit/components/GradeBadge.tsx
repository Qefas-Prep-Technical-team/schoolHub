import React from 'react';
import { cn } from '@/lib/utils';

interface GradeBadgeProps {
  grade: string;
  performance?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GradeBadge: React.FC<GradeBadgeProps> = ({ 
  grade, 
  performance, 
  size = 'md' 
}) => {
  const getPerformanceColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
      case 'B':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
      case 'C':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300';
      case 'D':
      case 'F':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
      default:
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={cn(
        'rounded-full font-bold',
        getPerformanceColor(grade),
        sizeClasses[size]
      )}>
        {grade}
      </div>
      {performance && (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          ({performance})
        </span>
      )}
    </div>
  );
};

export default GradeBadge;