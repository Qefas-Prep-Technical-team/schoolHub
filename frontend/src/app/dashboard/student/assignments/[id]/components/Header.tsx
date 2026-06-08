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
  // Helper to calculate time remaining
  const calculateTimeRemaining = () => {
    if (!assignment?.dueDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const now = new Date().getTime();
    const due = new Date(assignment.dueDate).getTime();
    const diff = Math.max(due - now, 0);

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isMounted, setIsMounted] = useState(false);

  // Update countdown every second
  useEffect(() => {
    setIsMounted(true);
    setTimeRemaining(calculateTimeRemaining());
    
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
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

  const isPastDue = assignment?.dueDate && new Date().getTime() > new Date(assignment.dueDate).getTime();
  const isGraded = assignment.status === 'GRADED' || assignment.status === 'graded' || assignment.submissions?.[0]?.status === 'GRADED' || assignment.submissions?.[0]?.status === 'graded';
  const isSubmitted = assignment.status === 'SUBMITTED' || assignment.status === 'submitted' || assignment.submissions?.[0]?.status === 'SUBMITTED' || assignment.submissions?.[0]?.status === 'submitted' || isGraded;
  const effectiveStatus = (isPastDue && !isGraded && !isSubmitted) 
    ? 'overdue' 
    : (assignment?.status || 'unknown');

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
            <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-3 ${getStatusColor(effectiveStatus)}`}>
              <p className="text-sm font-medium capitalize">
                {effectiveStatus.replace('_', ' ').toLowerCase()}
              </p>
            </div>
            {assignment?.dueDate && (
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
        
        {/* Right Side: Dynamic State Panel */}
        <div className="w-full md:w-auto md:min-w-[320px]">
          {isGraded ? (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800/50">
              <p className="text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">
                Final Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {assignment.grade || '0'}
                </span>
                <span className="text-xl font-medium text-slate-500 dark:text-slate-400">
                  / {assignment.totalMarks}
                </span>
              </div>
            </div>
          ) : isSubmitted ? (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 p-6 border border-blue-200 dark:border-blue-800/50">
              <span className="material-symbols-outlined text-4xl text-blue-500 dark:text-blue-400 mb-2">
                pending_actions
              </span>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Awaiting Results
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                Your submission is currently being reviewed.
              </p>
            </div>
          ) : assignment.dueDate ? (
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800/50 p-4">
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
          ) : null}
        </div>
      </div>
    </header>
  );
}
