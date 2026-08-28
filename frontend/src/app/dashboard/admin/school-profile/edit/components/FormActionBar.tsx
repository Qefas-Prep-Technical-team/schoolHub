import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface FormActionBarProps {
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  variant?: 'default' | 'floating';
}

const FormActionBar: React.FC<FormActionBarProps> = ({
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  variant = 'default'
}) => {
  const containerClasses = variant === 'floating'
    ? "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg flex items-center gap-4 min-w-[300px] justify-between animate-in slide-in-from-bottom-8 duration-500"
    : "sticky bottom-0 z-10 py-4 -mx-6 -mb-8 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent";

  return (
    <div className={containerClasses}>
      <div className={variant === 'floating' ? "flex items-center gap-4 w-full" : "flex justify-end gap-3 px-6"}>
        <button
          onClick={onReset}
          disabled={!hasChanges || isSaving}
          className="flex items-center justify-center h-11 px-6 text-sm font-medium leading-normal transition-colors border rounded-lg cursor-pointer bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={16} className="mr-2" />
          Reset
        </button>
        
        <button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="flex items-center justify-center h-11 px-6 text-sm font-medium leading-normal text-white transition-colors border rounded-lg cursor-pointer bg-primary border-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default FormActionBar;

