'use client';

import { useState, useEffect } from 'react';
import { Assignment } from './types';
import { Hourglass, Send, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  assignment: Assignment;
  onSubmit: () => void;
  onViewHistory?: () => void;
  submitLabel?: string;
}

export default function ActionFooter({ 
  assignment,
  onSubmit, 
  onViewHistory, 
  submitLabel = 'Submit Assignment' 
}: Props) {
  const isGraded = 
    assignment?.status === 'GRADED' || 
    assignment?.status === 'graded' || 
    assignment?.submissions?.[0]?.status === 'GRADED' || 
    assignment?.submissions?.[0]?.status === 'graded';

  const isSubmitted = 
    assignment?.status === 'SUBMITTED' || 
    assignment?.status === 'submitted' || 
    assignment?.submissions?.[0]?.status === 'SUBMITTED' || 
    assignment?.submissions?.[0]?.status === 'submitted' || 
    isGraded;

  const calculateReleaseTime = () => {
    const releaseDateStr = assignment?.scoreReleaseDate || assignment?.dueDate;
    if (!releaseDateStr) return null;
    const now = new Date().getTime();
    const release = new Date(releaseDateStr).getTime();
    const diff = Math.max(release - now, 0);

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [releaseTimeRemaining, setReleaseTimeRemaining] = useState(calculateReleaseTime());

  useEffect(() => {
    const releaseDateStr = assignment?.scoreReleaseDate || assignment?.dueDate;
    if (!isSubmitted || isGraded || !releaseDateStr) return;
    setReleaseTimeRemaining(calculateReleaseTime());
    
    const interval = setInterval(() => {
      const remaining = calculateReleaseTime();
      setReleaseTimeRemaining(remaining);
      
      if (remaining && remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assignment?.scoreReleaseDate, assignment?.dueDate, isSubmitted, isGraded]);

  // If the assignment is already graded, the score is released and displayed in the Header card.
  // There is no pending action, so never render a floating footer.
  if (isGraded) {
    return null;
  }

  // If already submitted and there's no history action to view, do not display a floating bar
  if (isSubmitted && !onViewHistory) {
    return null;
  }

  return (
    <footer className="sticky bottom-0 z-20 mt-8 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all shadow-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 md:px-6">
        <div>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
            >
              <History className="h-4 w-4" />
              Submission History
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isSubmitted ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-2 rounded-xl border border-blue-200/80 dark:border-blue-800/50 text-xs sm:text-sm">
              {releaseTimeRemaining && (releaseTimeRemaining.days > 0 || releaseTimeRemaining.hours > 0 || releaseTimeRemaining.minutes > 0 || releaseTimeRemaining.seconds > 0) ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Scores releasing in:</span>
                  <div className="flex gap-1 text-blue-800 dark:text-blue-200 font-mono font-black bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                    <span>{releaseTimeRemaining.days}d</span>
                    <span>{releaseTimeRemaining.hours}h</span>
                    <span>{releaseTimeRemaining.minutes}m</span>
                    <span>{releaseTimeRemaining.seconds}s</span>
                  </div>
                </div>
              ) : (
                <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Hourglass className="h-4 w-4 animate-pulse" />
                  Awaiting Review
                </span>
              )}
            </div>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md shadow-pink-500/20 active:scale-95 transition-all gap-2"
            >
              <Send className="h-4 w-4" />
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}