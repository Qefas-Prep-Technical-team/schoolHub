'use client';

import { SubmissionStatus } from "./types";


interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case 'graded':
        return {
          bg: 'bg-green-100 dark:bg-green-900/40',
          text: 'text-green-800 dark:text-green-300',
          label: 'Graded'
        };
      case 'ungraded':
        return {
          bg: 'bg-slate-100 dark:bg-slate-700/60',
          text: 'text-slate-800 dark:text-slate-300',
          label: 'Ungraded'
        };
      case 'late':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/40',
          text: 'text-amber-800 dark:text-amber-300',
          label: 'Late'
        };
      case 'not-submitted':
        return {
          bg: 'bg-red-100 dark:bg-red-900/40',
          text: 'text-red-800 dark:text-red-300',
          label: 'Not Submitted'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-700/60',
          text: 'text-slate-800 dark:text-slate-300',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}