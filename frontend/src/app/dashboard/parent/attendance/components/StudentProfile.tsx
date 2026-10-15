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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800/80">
      <div className="flex items-center gap-4">
        <div className="relative size-16 sm:size-20 shrink-0 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md">
          <Image
            src={student.imageUrl}
            alt={`Student portrait of ${student.name}`}
            fill
            className="object-cover"
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Attendance
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              Overview
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-sm text-slate-600 dark:text-slate-300 font-bold">
              {student.name}
            </p>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-900/30">
              {student.grade}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              ID: {student.studentId}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 self-start sm:self-auto">
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
            Last Synced
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
}
