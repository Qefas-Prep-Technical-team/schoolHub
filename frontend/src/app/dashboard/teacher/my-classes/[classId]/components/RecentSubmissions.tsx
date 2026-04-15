interface Submission {
  id: string;
  studentName: string;
  assignment: string;
  avatar: string;
  submittedDate: string;
  status: 'pending' | 'graded' | 'late';
  grade?: number;
}

interface RecentSubmissionsProps {
  submissions: Submission[];
  onGradeSubmission: (submissionId: string) => void;
  onViewAll: () => void;
}

export default function RecentSubmissions({ submissions, onGradeSubmission, onViewAll }: RecentSubmissionsProps) {
  const getStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'graded':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'late':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusText = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'graded':
        return 'Graded';
      case 'late':
        return 'Late';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Submissions
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <img
                src={submission.avatar}
                alt={submission.studentName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {submission.studentName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {submission.assignment}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {submission.submittedDate}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(submission.status)}`}>
                    {getStatusText(submission.status)}
                  </span>
                  {submission.grade && (
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {submission.grade}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onGradeSubmission(submission.id)}
              className="flex items-center justify-center h-9 px-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-bold whitespace-nowrap"
            >
              {submission.status === 'graded' ? 'Review Grade' : 'Grade Now'}
            </button>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-600 mb-3">
            <span className="material-symbols-outlined text-4xl">
              assignment
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No recent submissions</p>
        </div>
      )}
    </div>
  );
}