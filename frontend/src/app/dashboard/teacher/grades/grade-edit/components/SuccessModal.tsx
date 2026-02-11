import React from 'react';
import { CheckCircle } from 'lucide-react';
import { GradeSummary, Student } from './types';


interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  gradeSummary: GradeSummary;
  parentNotified?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  student,
  gradeSummary,
  parentNotified = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Changes Saved
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The student &apos; s grade has been updated.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Student: {student.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Subject: {student.subject}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Updated Total Score:{' '}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {gradeSummary.totalScore} / {gradeSummary.totalMaxScore} ({gradeSummary.finalGrade})
                </span>
              </p>
            </div>

            {/* Parent Notification Status */}
            {parentNotified && (
              <div className="flex items-center gap-3 pt-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Parent has been notified.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;