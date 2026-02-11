
import Link from 'next/link';
import { Assignment } from './types';

interface Props {
  assignment: Assignment;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
}

export default function AssignmentCard({ assignment, viewMode, onClick }: Props) {
  const getStatusColor = (status: string, color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return colorMap[color] || colorMap.orange;
  };

  const getStatusText = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'graded':
        return `Graded: ${assignment.grade}`;
      case 'submitted':
        return 'Submitted';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Pending';
    }
  };

  const getDueDateText = (assignment: Assignment) => {
    if (assignment.status === 'graded' && assignment.submissionDate) {
      return `Submitted: ${new Date(assignment.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    
    const dueDate = new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (assignment.status === 'overdue' && assignment.overdueDays) {
      return (
        <>
          <p>Due: {dueDate}</p>
          <p className="font-semibold text-red-500 dark:text-red-400">
            {assignment.overdueDays} days ago
          </p>
        </>
      );
    }
    
    if (assignment.dueInDays !== undefined) {
      return (
        <>
          <p>Due: {dueDate}</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            in {assignment.dueInDays} day{assignment.dueInDays !== 1 ? 's' : ''}
          </p>
        </>
      );
    }
    
    return `Due: ${dueDate}`;
  };

  const getProgressColor = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'text-green-500',
      blue: 'text-blue-500',
      orange: 'text-orange-500',
      red: 'text-red-500',
    };
    return colorMap[color] || colorMap.orange;
  };

  const strokeDashoffset = 100 - assignment.progress;

  return (
    <Link
    href={'/dashboard/student/assignments/' + assignment.id}
      onClick={onClick}
      className={`flex gap-4 p-6 bg-white dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200 cursor-pointer ${
        viewMode === 'list' ? 'flex-row' : 'flex-col'
      }`}
    >
      <div className={`flex ${viewMode === 'list' ? 'flex-1' : 'w-full'} items-start justify-between`}>
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">{assignment.subject}</p>
          <h3 className={`font-bold text-gray-900 dark:text-white ${
            viewMode === 'list' ? 'text-xl' : 'text-lg'
          }`}>
            {assignment.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.instructor}</p>
          
          {viewMode === 'list' && assignment.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {assignment.description}
            </p>
          )}
        </div>
        
        <div className="flex h-16 w-16 items-center justify-center">
          <div className="relative size-16">
            <svg className="size-full" height="36" viewBox="0 0 36 36" width="36">
              <circle
                className="stroke-current text-gray-200 dark:text-gray-700"
                cx="18"
                cy="18"
                fill="none"
                r="16"
                strokeWidth="2"
              />
              <circle
                className={`stroke-current ${getProgressColor(assignment.color)}`}
                cx="18"
                cy="18"
                fill="none"
                r="16"
                strokeDasharray="100"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-base font-bold ${getProgressColor(assignment.color)}`}>
                {assignment.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`flex items-center justify-between text-sm ${
        viewMode === 'list' ? 'mt-0' : 'mt-4'
      }`}>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status, assignment.color)}`}>
          {getStatusText(assignment)}
        </span>
        
        <div className={`text-right text-gray-500 dark:text-gray-400 ${
          viewMode === 'list' ? 'min-w-[120px]' : ''
        }`}>
          {getDueDateText(assignment)}
        </div>
      </div>
      
      {viewMode === 'list' && assignment.attachments && (
        <div className="flex items-center gap-2 mt-2">
          <span className="material-symbols-outlined text-sm text-gray-500 dark:text-gray-400">
            attach_file
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {assignment.attachments} attachment{assignment.attachments !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </Link>
  );
}