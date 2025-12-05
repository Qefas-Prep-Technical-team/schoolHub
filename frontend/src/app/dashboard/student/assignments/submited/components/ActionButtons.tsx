'use client';

import { Submission } from './types';
import { useState } from 'react';

interface Props {
  onBackToAssignments: () => void;
  onResubmit: () => void;
  onViewSubmission: () => void;
  timeUntilDue: string;
  submission: Submission;
}

export default function ActionButtons({
  onBackToAssignments,
  onResubmit,
  onViewSubmission,
  timeUntilDue,
  submission,
}: Props) {
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const handleResubmit = async () => {
    setIsResubmitting(true);
    try {
      await onResubmit();
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleViewSubmission = async () => {
    setIsViewing(true);
    try {
      await onViewSubmission();
    } finally {
      setIsViewing(false);
    }
  };

  const resubmissionAllowed = new Date() < new Date(submission.dueDate);

  return (
    <div className="flex flex-col justify-between sm:flex-row sm:items-start sm:gap-4 w-full">
      {/* Back button */}
      <button
        onClick={onBackToAssignments}
        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-11 px-6 text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        <span>Back to Assignments</span>
      </button>

      {/* Right section: Resubmit or View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
        {resubmissionAllowed ? (
          <button
            onClick={handleResubmit}
            disabled={isResubmitting}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-11 px-6 text-sm font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Resubmit Assignment</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
            {/* Status message */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 min-w-[160px] justify-center">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>{timeUntilDue || 'Assignment is now closed'}</span>
            </div>

            {/* View Submission Button */}
            <button
              onClick={handleViewSubmission}
              disabled={isViewing}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg h-11 px-6 text-sm font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isViewing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></span>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">visibility</span>
                  <span>View Submission Details</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
