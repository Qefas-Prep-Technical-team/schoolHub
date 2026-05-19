import React from 'react';
import { User } from 'lucide-react';
import { Student } from './types';
import PerformanceBadge from './PerformanceBadge';

interface StudentCardProps {
  student: Student;
  onClick?: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-[#1C182F] rounded-xl shadow-sm p-4 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick?.(student)}
    >
      {student.profileImage ? (
        <img
          alt={student.fullName}
          src={student.profileImage}
          className="w-20 h-20 rounded-full object-cover mb-4"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
          <User size={32} className="text-gray-500 dark:text-gray-400" />
        </div>
      )}
      
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
        {student.fullName}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        ID: {student.studentId}
      </p>
      
      <div className="mb-4">
        <PerformanceBadge performance={student.performance} />
      </div>
      
      <div className="w-full flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
        <div className="text-center">
          <div className="font-bold text-gray-800 dark:text-white">{student.attendance}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Attendance</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-800 dark:text-white">{student.lastScore}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Last Score</div>
        </div>
      </div>
      
      <button 
        className="w-full text-center text-primary font-bold py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(student);
        }}
      >
        View Profile
      </button>
    </div>
  );
};

export default StudentCard;