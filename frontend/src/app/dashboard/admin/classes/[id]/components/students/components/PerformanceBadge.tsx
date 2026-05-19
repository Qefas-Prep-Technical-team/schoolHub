import React from 'react';
import { PerformanceBadgeProps } from './types';

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ performance, size = 'md' }) => {
  const config = {
    excellent: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-300',
      label: 'Excellent'
    },
    good: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-300',
      label: 'Good'
    },
    average: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-300',
      label: 'Average'
    },
    weak: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-300',
      label: 'Weak'
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const { bg, text, label } = config[performance];

  return (
    <span className={`font-semibold rounded-full ${bg} ${text} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
};

export default PerformanceBadge;