import { ArrowRight } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  status: 'pending' | 'due_soon' | 'recent';
  action: string | null;
  dueDate: string | null;
}

interface AssignmentsExamsProps {
  assignments: Assignment[];
  onViewAll: () => void;
}

export default function AssignmentsExams({ assignments, onViewAll }: AssignmentsExamsProps) {
  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'due_soon':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'recent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Grading';
      case 'due_soon':
        return 'Due Soon';
      case 'recent':
        return 'Recently Submitted';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Assignments & Exams
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/60 transition-colors"
          >
            {/* Icon */}
            <div className={`${assignment.iconColor} mr-4`}>
              <span className="material-symbols-outlined text-xl">
                {assignment.icon}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-200 text-sm">
                {assignment.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {assignment.description}
              </p>
            </div>

            {/* Action/Status */}
            <div className="flex flex-col items-end gap-2">
              {assignment.action ? (
                <button className="px-3 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-full transition-colors">
                  {assignment.action}
                </button>
              ) : (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {assignments.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <span className="material-symbols-outlined text-4xl">
              assignment
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No pending assignments or exams
          </p>
        </div>
      )}
    </div>
  );
}