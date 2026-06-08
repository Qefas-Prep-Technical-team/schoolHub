import { useState, useEffect } from 'react';
import { Assignment } from './types';

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
  const isGraded = assignment.status === 'GRADED' || assignment.status === 'graded' || assignment.submissions?.[0]?.status === 'GRADED' || assignment.submissions?.[0]?.status === 'graded';
  const isSubmitted = assignment.status === 'SUBMITTED' || assignment.status === 'submitted' || assignment.submissions?.[0]?.status === 'SUBMITTED' || assignment.submissions?.[0]?.status === 'submitted' || isGraded;

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
      
      // If time has run out, reload to fetch graded status
      if (remaining && remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assignment?.scoreReleaseDate, assignment?.dueDate, isSubmitted]);

  return (
    <footer className="sticky bottom-0 z-10 mt-8 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="text-sm font-medium text-primary dark:text-pink-400 hover:text-primary/80 dark:hover:text-pink-300 hover:underline cursor-pointer"
            >
              View Submission History
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isSubmitted ? (
            <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
              {releaseTimeRemaining && (releaseTimeRemaining.days > 0 || releaseTimeRemaining.hours > 0 || releaseTimeRemaining.minutes > 0 || releaseTimeRemaining.seconds > 0) ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Scores releasing in:</span>
                  <div className="flex gap-2 text-blue-800 dark:text-blue-200 font-mono font-bold text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-md">
                    <span>{releaseTimeRemaining.days}d</span>
                    <span>{releaseTimeRemaining.hours}h</span>
                    <span>{releaseTimeRemaining.minutes}m</span>
                    <span>{releaseTimeRemaining.seconds}s</span>
                  </div>
                </div>
              ) : isGraded ? (
                <span className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Results Released
                </span>
              ) : (
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">hourglass_top</span>
                  Awaiting Result
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-lg cursor-pointer bg-primary dark:bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 dark:hover:bg-pink-700 transition-colors"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}