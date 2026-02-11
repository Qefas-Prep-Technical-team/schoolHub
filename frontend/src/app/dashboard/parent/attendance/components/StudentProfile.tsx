import Image from 'next/image';
import { Download } from 'lucide-react';

interface StudentProfileProps {
  student: {
    name: string;
    grade: string;
    studentId: string;
    imageUrl: string;
  };
  lastUpdated: string;
}

export default function StudentProfile({ student, lastUpdated }: StudentProfileProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative size-16 md:size-20 shrink-0">
            <Image
              src={student.imageUrl}
              alt={`Student portrait of ${student.name}`}
              fill
              className="rounded-full shadow-sm border-2 border-white dark:border-gray-700 object-cover"
            />
          </div>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Attendance Overview
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                {student.name} • {student.grade}
              </p>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Student ID: {student.studentId}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            Last Updated
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {lastUpdated}
          </span>
        </div>
        
        <button className="flex items-center gap-2 px-4 h-10 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-bold text-gray-700 dark:text-gray-200">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Report</span>
        </button>
      </div>
    </div>
  );
}