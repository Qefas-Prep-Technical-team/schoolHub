import React from 'react';
import { ExamStatus } from './types';

interface StatusBadgeProps {
  status: ExamStatus;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  const config = {
    draft: {
      bg: 'bg-gray-200 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-300',
      dot: 'bg-gray-500'
    },
    scheduled: {
      bg: 'bg-gray-200 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-300',
      dot: 'bg-gray-500'
    },
    active: {
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-blue-500 animate-pulse'
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-green-500'
    },
    graded: {
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-800 dark:text-purple-300',
      dot: 'bg-purple-500'
    }
  };

  const statusText = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    active: 'Active',
    completed: 'Completed',
    graded: 'Graded'
  };

  const { bg, text, dot } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${bg} ${text}`}>
      {showDot && <div className={`w-2 h-2 rounded-full ${dot}`}></div>}
      <span>{statusText[status]}</span>
    </div>
  );
};

export default StatusBadge;