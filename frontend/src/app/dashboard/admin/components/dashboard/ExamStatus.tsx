'use client';

import { Clock, Calendar, CheckCircle, FileText, AlertCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'ongoing' | 'upcoming' | 'grading' | 'completed';
  time: string;
  description?: string;
  teacher?: string;
}

export default function ExamStatus() {
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      title: 'Mathematics Mid-Term',
      subject: 'Mathematics',
      grade: 'Grade 10',
      status: 'ongoing',
      time: 'Ends in 2 hrs',
      description: 'Algebra & Calculus sections',
      teacher: 'Mr. Anderson',
    },
    {
      id: '2',
      title: 'Physics Practical',
      subject: 'Physics',
      grade: 'Grade 12',
      status: 'upcoming',
      time: 'Tomorrow, 9:00 AM',
      description: 'Lab equipment check required',
      teacher: 'Mrs. Robinson',
    },
    {
      id: '3',
      title: 'English Literature',
      subject: 'English',
      grade: 'Grade 11',
      status: 'grading',
      time: 'Completed yesterday',
      description: 'Essay submissions pending review',
      teacher: 'Ms. Johnson',
    },
  ]);

  const getStatusConfig = (status: Exam['status']) => {
    switch (status) {
      case 'ongoing':
        return {
          icon: Clock,
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          label: 'Ongoing',
          statusType: 'pending' as const,
        };
      case 'upcoming':
        return {
          icon: Calendar,
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          label: 'Upcoming',
          statusType: 'active' as const,
        };
      case 'grading':
        return {
          icon: CheckCircle,
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          label: 'Grading',
          statusType: 'success' as const,
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
          label: 'Completed',
          statusType: 'success' as const,
        };
    }
  };

  const handleExamClick = (examId: string) => {
    console.log('Viewing exam:', examId);
    // Navigate to exam details page
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Exam Status
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {exams.length} active exams
          </p>
        </div>
        <Link
          href="/admin/exams"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Manage Exams
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
        {exams.map((exam) => {
          const statusConfig = getStatusConfig(exam.status);
          const Icon = statusConfig.icon;

          return (
            <div
              key={exam.id}
              onClick={() => handleExamClick(exam.id)}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {exam.title}
                    </p>
                    <StatusBadge
                      status={statusConfig.statusType}
                      label={statusConfig.label}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    {exam.grade} • {exam.subject} • {exam.teacher}
                  </p>
                  <p className="text-xs text-slate-400">{exam.time}</p>
                  {exam.description && (
                    <p className="text-xs text-slate-500 mt-2">
                      {exam.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Status
                </p>
                <span className={`${statusConfig.color} text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                  <Icon className="h-3 w-3" />
                  {statusConfig.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              1 exam ending soon
            </p>
          </div>
          <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Schedule New Exam
          </button>
        </div>
      </div>
    </div>
  );
}