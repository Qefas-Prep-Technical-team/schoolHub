import React from 'react';

import GradeBadge from './GradeBadge';
import { Student } from './types';

interface StudentInfoCardProps {
  student: Student;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student }) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
      {/* Student Info */}
      <div className="flex items-center gap-4">
        <img
          className="w-16 h-16 rounded-full object-cover"
          src={student.avatarUrl}
          alt={`Profile of ${student.name}`}
        />
        <div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {student.name}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adm. No: {student.admissionNumber} • Class: {student.className} • Subject: {student.subject}
          </p>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg text-slate-700 dark:text-slate-300">
          Overall Performance:
        </span>
        <GradeBadge grade={student.overallGrade} />
      </div>
    </div>
  );
};

export default StudentInfoCard;