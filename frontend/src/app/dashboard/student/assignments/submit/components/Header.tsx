import { Assignment } from './types';

interface Props {
  assignment: Assignment;
  onViewInstructions?: () => void;
}

export default function Header({ assignment, onViewInstructions }: Props) {
  const formatDueDate = (dateString: string) => {
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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[#0e121b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] sm:text-4xl">
          {assignment.title}
        </h1>
        <p className="text-[#506795] dark:text-white/60 text-base font-normal leading-normal">
          Due: {formatDueDate(assignment.dueDate)}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-sm text-[#506795] dark:text-white/60">
            {assignment.course} • {assignment.instructor}
          </p>
          <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300">
            {assignment.points} points
          </div>
        </div>
      </div>
      
      {onViewInstructions && (
        <button
          onClick={onViewInstructions}
          className="text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:underline"
        >
          View Instructions
        </button>
      )}
    </div>
  );
}