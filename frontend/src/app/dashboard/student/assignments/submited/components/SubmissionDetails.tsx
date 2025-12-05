import { Submission } from './types';

interface Props {
  submission: Submission;
}

export default function SubmissionDetails({ submission }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 text-left mb-8">
      <div className="flex flex-col gap-1">
        <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal">
          Assignment
        </p>
        <p className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal">
          {submission.assignment}
        </p>
      </div>
      
      <div className="flex flex-col gap-1">
        <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal">
          Course
        </p>
        <p className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal">
          {submission.course}
        </p>
      </div>
      
      <div className="flex flex-col gap-1">
        <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal">
          Submitted on
        </p>
        <p className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal">
          {formatDate(submission.submittedAt)}
        </p>
      </div>
      
      <div className="flex flex-col gap-1">
        <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal">
          Status
        </p>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            submission.status === 'graded'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
          }`}>
            {submission.status === 'graded' ? 'Graded' : 'Awaiting Grade'}
          </span>
          {submission.grade && (
            <span className="text-[#0e121b] dark:text-white/90 text-sm font-bold">
              {submission.grade}
            </span>
          )}
        </div>
      </div>
      
      {submission.gradedAt && (
        <div className="flex flex-col gap-1">
          <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal">
            Graded on
          </p>
          <p className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal">
            {formatDate(submission.gradedAt)}
          </p>
        </div>
      )}
      
      {submission.instructor && (
        <div className="flex flex-col gap-1">
          <p className="text-[#506795] dark:text-gray-400 text-sm font-normal leading-normal">
            Graded by
          </p>
          <p className="text-[#0e121b] dark:text-white/90 text-sm font-medium leading-normal">
            {submission.instructor}
          </p>
        </div>
      )}
    </div>
  );
}