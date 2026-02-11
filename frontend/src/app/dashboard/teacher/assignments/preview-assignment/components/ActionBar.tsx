'use client';

interface ActionBarProps {
  onCancel: () => void;
  onSave: () => void;
  isLoading?: boolean;
  isValid?: boolean;
}

export default function ActionBar({ 
  onCancel, 
  onSave, 
  isLoading = false,
  isValid = true 
}: ActionBarProps) {
  return (
    <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-transparent text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading || !isValid}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary text-white font-bold hover:bg-primary/90 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Grade'
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}