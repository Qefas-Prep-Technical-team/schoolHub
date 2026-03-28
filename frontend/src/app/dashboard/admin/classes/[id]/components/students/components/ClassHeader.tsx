import React from 'react';
import { ClipboardList, MessageSquare } from 'lucide-react';
import { ClassInfo } from './types';

interface ClassHeaderProps {
  classInfo: ClassInfo;
  onTakeAttendance?: () => void;
  onMessageAll?: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ 
  classInfo, 
  onTakeAttendance, 
  onMessageAll 
}) => {
  return (
    <div className="sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm py-4 z-10">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            {classInfo.name} – {classInfo.subject}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
            Code: {classInfo.code} | {classInfo.totalStudents} Students
          </p>
        </div>
        
        <div className="flex flex-1 sm:flex-none gap-3 flex-wrap justify-start">
          <button
            onClick={onTakeAttendance}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
          >
            <ClipboardList size={18} className="mr-2" />
            <span className="truncate">Take Attendance</span>
          </button>
          
          <button
            onClick={onMessageAll}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors"
          >
            <MessageSquare size={18} className="mr-2" />
            <span className="truncate">Message All Students</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassHeader;