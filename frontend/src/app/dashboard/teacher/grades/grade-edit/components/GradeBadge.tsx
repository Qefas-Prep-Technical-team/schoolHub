import React from 'react';
import { cn } from '@/lib/utils';
import { getGradeColorAndBg } from '@/utils/gradingSystem';

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
  const { color, bg } = getGradeColorAndBg(grade);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={cn(
        'rounded-full font-bold border',
        bg,
        color,
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
