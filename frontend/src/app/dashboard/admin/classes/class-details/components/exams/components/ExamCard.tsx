import React from 'react';
import { Edit2, BarChart3 } from 'lucide-react';
import { Exam } from './types';
import StatusBadge from './StatusBadge';

interface ExamCardProps {
  exam: Exam;
  onEdit?: (exam: Exam) => void;
  onViewResults?: (exam: Exam) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onEdit, onViewResults }) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const completionPercentage = exam.totalStudents > 0 
    ? Math.round((exam.completedStudents / exam.totalStudents) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 p-5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[#0e101b] dark:text-white truncate">
            {exam.title}
          </h2>
          <div className="flex items-center gap-x-3 text-sm text-[#4f5c96] dark:text-gray-400 mt-1 flex-wrap gap-y-1">
            <span className="capitalize">{exam.type}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>
              {new Date(exam.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} | {formatDuration(exam.duration)}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>{exam.totalMarks} Marks</span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <StatusBadge status={exam.status} />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-[#4f5c96] dark:text-gray-400">
          <span className="font-medium text-[#0e101b] dark:text-white">
            {exam.completedStudents}/{exam.totalStudents}
          </span> Students Completed
          {exam.totalStudents > 0 && (
            <span className="ml-2">({completionPercentage}%)</span>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {onEdit && (
            <button
              onClick={() => onEdit(exam)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors"
            >
              <Edit2 size={16} />
              <span className="truncate">Edit Exam</span>
            </button>
          )}
          
          {onViewResults && exam.status === 'completed' && (
            <button
              onClick={() => onViewResults(exam)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-opacity"
            >
              <BarChart3 size={16} />
              <span className="truncate">View Results</span>
            </button>
          )}
          
          {exam.status === 'active' && (
            <button
              onClick={() => onViewResults?.(exam)}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-opacity"
            >
              <BarChart3 size={16} />
              <span className="truncate">Live Results</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCard;