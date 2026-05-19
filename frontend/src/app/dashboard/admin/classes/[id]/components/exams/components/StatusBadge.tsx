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
    unpublished: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      dot: 'bg-yellow-500'
    },
    scheduled: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-800 dark:text-orange-300',
      dot: 'bg-orange-500'
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
    expired: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-red-500'
    },
    graded: {
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-800 dark:text-purple-300',
      dot: 'bg-purple-500'
    }
  };

  const statusText = {
    draft: 'Draft',
    unpublished: 'Unpublished',
    scheduled: 'Inactive',
    active: 'Active',
    completed: 'Completed',
    expired: 'Expired',
    graded: 'Graded'
  };

  const { bg, text, dot } = config[status] || config.draft || { bg: '', text: '', dot: '' };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${bg} ${text}`}>
      {showDot && <div className={`w-2 h-2 rounded-full ${dot}`}></div>}
      <span>{statusText[status] || status}</span>
    </div>
  );
};

export default StatusBadge;