import React from 'react';
import { User, ArrowRight, GraduationCap } from 'lucide-react';
import { Student } from './types';
import PerformanceBadge from './PerformanceBadge';

interface StudentCardProps {
  student: Student;
  onClick?: (student: Student) => void;
  onPromote?: (student: Student) => void;
  onGraduate?: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onClick,
  onPromote,
  onGraduate,
}) => {
  return (
    <div 
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs p-6 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer group"
      onClick={() => onClick?.(student)}
    >
      {student.profileImage ? (
        <img
          alt={student.fullName}
          src={student.profileImage}
          className="w-20 h-20 rounded-full object-cover mb-4 ring-2 ring-slate-100 dark:ring-slate-800"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-slate-150 dark:bg-slate-800 flex items-center justify-center mb-4 ring-2 ring-slate-100 dark:ring-slate-800">
          <User size={32} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      
      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-0.5 line-clamp-1">
        {student.fullName}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
        ID: {student.studentId}
      </p>
      
      <div className="mb-4">
        <PerformanceBadge performance={student.performance} />
      </div>
      
      <div className="w-full flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-4 px-2 bg-slate-50 dark:bg-slate-800/40 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <div className="font-bold text-slate-900 dark:text-white">{student.attendance}%</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Attendance</div>
        </div>
        <div className="w-px bg-slate-200 dark:bg-slate-700" />
        <div className="text-center">
          <div className="font-bold text-slate-900 dark:text-white">{student.lastScore}%</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Last Score</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-2 mb-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPromote?.(student);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 transition-colors"
          title="Promote to another class"
        >
          <ArrowRight size={13} />
          <span>Promote</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGraduate?.(student);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 transition-colors"
          title="Mark student as graduated"
        >
          <GraduationCap size={14} />
          <span>Graduate</span>
        </button>
      </div>
      
      <button 
        type="button"
        className="w-full text-center text-primary dark:text-indigo-400 font-bold py-1.5 rounded-xl hover:bg-primary/10 transition-colors text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(student);
        }}
      >
        View Full Details
      </button>
    </div>
  );
};

export default StudentCard;