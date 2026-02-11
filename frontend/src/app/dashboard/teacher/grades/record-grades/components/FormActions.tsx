import React from 'react';

interface FormActionsProps {
  onSaveDraft: () => void;
  onSubmitFinal: () => void;
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSaveDraft,
  onSubmitFinal,
  isSubmitting = false,
}) => {
  return (
    <div className="flex justify-end pt-4">
      <div className="flex flex-1 gap-3 flex-wrap justify-end">
        <button
          onClick={onSaveDraft}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200/80 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300/80 dark:hover:bg-gray-600 text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Save Draft</span>
        </button>
        <button
          onClick={onSubmitFinal}
          disabled={isSubmitting}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {isSubmitting ? 'Submitting...' : 'Submit Final Grades'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FormActions;