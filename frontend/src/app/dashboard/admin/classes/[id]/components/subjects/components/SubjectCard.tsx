import React from 'react';
import { BookOpen } from 'lucide-react';
import { Subject } from './types';
import ProgressBar from './ProgressBar';

interface SubjectCardProps {
  subject: Subject;
  onClick?: (subject: Subject) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  return (
    <div 
      className="flex flex-col gap-4 rounded-xl bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-white/10 p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick?.(subject)}
    >
      <div className="flex items-center gap-3">
        {subject.icon ? (
          <div 
            className="w-12 h-12 rounded-lg bg-center bg-no-repeat aspect-square bg-cover flex-shrink-0"
            style={{ backgroundImage: `url(${subject.icon})` }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-primary" size={24} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white text-lg font-semibold leading-normal truncate">
            {subject.name}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
            {subject.assignments} Assignments, {subject.exams} Exams
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <ProgressBar value={subject.classPerformance} />
      </div>
      
      <button 
        className="w-full flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 text-sm font-bold leading-normal hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(subject);
        }}
      >
        Open Subject
      </button>
    </div>
  );
};

export default SubjectCard;