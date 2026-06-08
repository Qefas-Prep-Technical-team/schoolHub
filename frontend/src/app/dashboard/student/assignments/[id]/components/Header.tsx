'use client'

import { useEffect, useState } from 'react';
import { Assignment } from './types';

interface Props {
  assignment: Assignment;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Header({ assignment }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const due = new Date(assignment.dueDate).getTime();
      const diff = Math.max(due - now, 0);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [assignment.dueDate]);

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-warning/20 text-warning';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-500';
      case 'submitted':
        return 'bg-success/20 text-success';
      case 'graded':
        return 'bg-green-500/20 text-green-500';
      case 'overdue':
        return 'bg-danger/20 text-danger';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <header className="mb-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left Side */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden"
            >
              {assignment.teacher?.user?.avatarUrl ? (
                <img src={assignment.teacher.user.avatarUrl} alt={`${assignment.teacher.firstName}'s profile`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-500">{assignment.teacher?.firstName?.[0] || 'T'}</span>
              )}
            </div>
            <div>
              <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">
                {assignment.teacher?.firstName} {assignment.teacher?.lastName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {assignment.subject?.name}
              </p>
            </div>
          </div>
          
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black tracking-tighter mb-3">
            {assignment.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-3 ${getStatusColor(assignment.status)}`}>
              <p className="text-sm font-medium capitalize">
                {assignment.status.replace('_', ' ').toLowerCase()}
              </p>
            </div>
            {assignment.dueDate && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Due: {formatDueDate(assignment.dueDate)}
              </p>
            )}
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-base">grade</span>
              <span className="text-sm font-medium">{assignment.totalMarks} points</span>
            </div>
          </div>
        </div>
        
        {/* Right Side: Countdown Timer */}
        {assignment.dueDate && (
          <div className="w-full md:w-auto md:min-w-80 rounded-lg bg-slate-100 dark:bg-slate-800/50 p-4">
            <p className="text-sm font-medium text-center text-slate-600 dark:text-slate-400 mb-3">
              Time Remaining
            </p>
          <div className="flex gap-3">
            {[
              { value: timeRemaining.days, label: 'Days' },
              { value: timeRemaining.hours, label: 'Hours' },
              { value: timeRemaining.minutes, label: 'Minutes' },
              { value: timeRemaining.seconds, label: 'Seconds' },
            ].map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-16 w-full items-center justify-center rounded-lg bg-white dark:bg-slate-900">
                  <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">
                    {item.value.toString().padStart(2, '0')}
                  </p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>
    </header>
  );
}
