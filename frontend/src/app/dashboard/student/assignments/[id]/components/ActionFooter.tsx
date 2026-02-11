import Link from "next/link";

interface Props {
  onSubmit: () => void;
  onViewHistory?: () => void;
  submitLabel?: string;
}

export default function ActionFooter({ 
  onSubmit, 
  onViewHistory, 
  submitLabel = 'Submit Assignment' 
}: Props) {
  return (
    <footer className="sticky bottom-0 z-10 mt-8 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {onViewHistory && (
          <Link href={'/dashboard/student/assignments/GradedAssignment/1'}>

          <button
            onClick={onViewHistory}
            className="text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            View Submission History
          </button>
          </Link>
        )}
        
        <div className="flex items-center gap-4">
          <button className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Save as Draft
          </button>
          <Link href={'/dashboard/student/assignments/submit/1'}
          className="cursor-pointer"
          >

          <button
            onClick={onSubmit}
            className="rounded-lg cursor-pointer bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 transition-colors"
          >
            {submitLabel}
          </button>
          </Link>
        </div>
      </div>
    </footer>
  );
}