import React from 'react';
import { cn } from '@/lib/utils';

interface FormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSave,
  isSaving = false,
  isDirty = true,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex justify-end items-center gap-3">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={cn(
            'flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] gap-2 transition-colors',
            isDirty && !isSaving
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          )}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default FormActions;