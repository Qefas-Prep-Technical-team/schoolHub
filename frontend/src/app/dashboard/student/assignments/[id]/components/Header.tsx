'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assignment } from './types';
import { Award, Clock, CheckCircle2, Hourglass, Calendar, AlertCircle, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

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
  const router = useRouter();

  const calculateTimeRemaining = (): TimeRemaining => {
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

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment.dueDate]);

  const isPastDue = assignment?.dueDate && new Date().getTime() > new Date(assignment.dueDate).getTime();
  const isGraded = assignment.status === 'GRADED' || assignment.status === 'graded' || assignment.submissions?.[0]?.status === 'GRADED' || assignment.submissions?.[0]?.status === 'graded';
  const isSubmitted = assignment.status === 'SUBMITTED' || assignment.status === 'submitted' || assignment.submissions?.[0]?.status === 'SUBMITTED' || assignment.submissions?.[0]?.status === 'submitted' || isGraded;
  
  const effectiveStatus = (isPastDue && !isGraded && !isSubmitted) 
    ? 'overdue' 
    : (isGraded ? 'graded' : isSubmitted ? 'submitted' : assignment?.status || 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <header className="mb-5 sm:mb-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 md:p-8 shadow-xs">
      
      {/* Mobile-Friendly Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => router.push('/dashboard/student/assignments')}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95 py-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Assignments</span>
        </button>

        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
          {assignment.subject?.name || 'Academic Course'}
        </span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        
        {/* Left Section: Teacher Info, Title, Metadata */}
        <div className="flex-1 min-w-0">
          
          {/* Teacher and Subject Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
            <div className="size-9 sm:size-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {assignment.teacher?.user?.avatarUrl ? (
                <img 
                  src={assignment.teacher.user.avatarUrl} 
                  alt={`${assignment.teacher.firstName}'s avatar`} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <span className="text-xs sm:text-sm font-black text-pink-600 dark:text-pink-400">
                  {assignment.teacher?.firstName?.[0] || 'T'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold truncate">
                {assignment.teacher ? `${assignment.teacher.firstName || ''} ${assignment.teacher.lastName || ''}`.trim() : 'Instructor'}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium truncate">
                Teacher & Course Evaluator
              </p>
            </div>
          </div>
          
          {/* Assignment Title */}
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight break-words mb-3">
            {assignment.title}
          </h1>
          
          {/* Badges and metadata pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border shadow-2xs ${getStatusBadge(effectiveStatus)}`}>
              {effectiveStatus === 'graded' && <CheckCircle2 className="h-3.5 w-3.5" />}
              {effectiveStatus === 'submitted' && <CheckCircle2 className="h-3.5 w-3.5" />}
              {effectiveStatus === 'overdue' && <AlertCircle className="h-3.5 w-3.5" />}
              {effectiveStatus === 'pending' && <Clock className="h-3.5 w-3.5" />}
              <span className="text-[11px] font-extrabold">{effectiveStatus}</span>
            </span>

            {assignment.totalMarks && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-slate-700 shadow-2xs text-[11px]">
                <Award className="h-3.5 w-3.5 text-pink-500" />
                <span>{assignment.totalMarks} pts</span>
              </span>
            )}

            {assignment.dueDate && (
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium py-0.5 text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Due: {format(new Date(assignment.dueDate), "MMM d, h:mm a")}</span>
              </span>
            )}
          </div>
        </div>
        
        {/* Right Section: Compact High-Tech Timer / Score Card */}
        <div className="w-full lg:w-auto lg:min-w-[260px] shrink-0 pt-1 lg:pt-0">
          {isGraded ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-3.5 sm:p-5 border border-emerald-200/80 dark:border-emerald-800/50 shadow-xs text-center">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Graded Result
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {assignment.grade || '0'}
                </span>
                <span className="text-xs sm:text-base font-bold text-slate-400">
                  / {assignment.totalMarks || 100} pts
                </span>
              </div>
            </div>
          ) : isSubmitted ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/20 p-3.5 sm:p-5 border border-blue-200/80 dark:border-blue-800/50 shadow-xs text-center">
              <Hourglass className="h-5 w-5 text-blue-500 mb-1.5 animate-pulse" />
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Submission Received
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px]">
                Under evaluation by instructor.
              </p>
            </div>
          ) : assignment.dueDate ? (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-pink-500" /> Time Remaining
                </span>
                {isPastDue && (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    Overdue
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: timeRemaining.days, label: 'd' },
                  { value: timeRemaining.hours, label: 'h' },
                  { value: timeRemaining.minutes, label: 'm' },
                  { value: timeRemaining.seconds, label: 's' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <div className="h-10 sm:h-12 w-full flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                      <span className="text-slate-900 dark:text-white text-sm sm:text-lg font-black font-mono">
                        {item.value.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-tight mt-0.5">
                      {item.label}
                    </span>
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
