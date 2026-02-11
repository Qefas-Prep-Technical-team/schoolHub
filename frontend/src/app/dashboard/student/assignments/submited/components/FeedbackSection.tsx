import { Submission } from './types';

interface Props {
  submission: Submission;
}

export default function FeedbackSection({ submission }: Props) {
  if (submission.status !== 'graded' || !submission.feedback) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl border-t border-gray-200 dark:border-white/10 pt-8 mt-8">
      <h3 className="text-[#0e121b] dark:text-white text-lg font-semibold mb-4">
        Instructor Feedback
      </h3>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 mt-0.5">
            comment
          </span>
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
              Comments from your instructor:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {submission.feedback}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}