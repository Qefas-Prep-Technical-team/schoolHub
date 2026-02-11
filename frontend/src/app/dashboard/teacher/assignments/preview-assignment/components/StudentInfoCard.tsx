'use client';

import { Student } from './types';
import Image from 'next/image';

interface StudentInfoCardProps {
  student: Student;
}

export default function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 min-w-16">
          <Image
  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBabJ4l9..."
  alt="student avatar"
  width={50}
  height={50}
/>

        </div>
        <div className="flex flex-col">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {student.name}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Student ID: {student.studentId}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {student.grade} - {student.subject}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Submitted: {student.submittedAt}
          </p>
        </div>
      </div>
    </div>
  );
}