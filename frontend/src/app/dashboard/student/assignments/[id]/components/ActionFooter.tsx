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
          {/* <button className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Save as Draft
          </button> */}
          <button
            onClick={onSubmit}
            className="rounded-lg cursor-pointer bg-primary dark:bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 dark:hover:bg-pink-700 transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </footer>
  );
}