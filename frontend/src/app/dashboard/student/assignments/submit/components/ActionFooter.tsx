import  Link  from 'next/link';
import { TimeRemaining } from './types';

interface Props {
  timeRemaining: TimeRemaining;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSaving: boolean;
  disabled: boolean;
}

export default function ActionFooter({
  timeRemaining,
  onSaveDraft,
  onSubmit,
  isSubmitting,
  isSaving,
  disabled,
}: Props) {
  const formatTimeRemaining = () => {
    const { days, hours, minutes } = timeRemaining;
    return `${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m`;
  };

  const isOverdue = timeRemaining.days === 0 && 
    timeRemaining.hours === 0 && 
    timeRemaining.minutes === 0 && 
    timeRemaining.seconds === 0;

  return (
    <footer className="sticky bottom-0 z-10 mt-auto bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-gray-200 dark:border-white/10">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
            schedule
          </span>
          <p className="text-sm font-medium">
            <span className="text-[#506795] dark:text-white/60">Time Remaining:</span>{' '}
            <span className={isOverdue ? 'text-red-500 font-bold' : 'text-[#0e121b] dark:text-white'}>
              {isOverdue ? 'OVERDUE' : formatTimeRemaining()}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href={'/dashboard/student/assignments/submited/1'}>
          <button
            onClick={onSaveDraft}
            disabled={isSaving || isSubmitting}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-transparent text-[#0e121b] dark:text-white/90 text-sm font-bold leading-normal tracking-[0.015em] border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full size-4 border-2 border-gray-400 border-t-transparent"></span>
                Saving...
              </span>
            ) : (
              <span className="truncate">Save as Draft</span>
            )}
          </button>
            </Link>
          
          <button
            onClick={onSubmit}
            disabled={disabled || isSubmitting || isSaving}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent"></span>
                Submitting...
              </span>
            ) : (
              
              <span className="truncate">Submit Assignment</span>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}