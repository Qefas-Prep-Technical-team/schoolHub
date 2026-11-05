'use client';

import { useMemo } from 'react';
import { Send } from 'lucide-react';
import { Student } from './types';
import { computeGradePill } from '@/utils/gradingSystem';
import { groupByDate } from '@/app/dashboard/teacher/utils/dateSectioning';


interface StudentListProps {
  title: string;
  students: Student[];
  showScore?: boolean;
  showReminderButton?: boolean;
  gradingSystem?: any[] | null;
}

export default function StudentList({
  title,
  students,
  showScore = false,
  showReminderButton = false,
  gradingSystem,
}: StudentListProps) {
  const handleSendReminder = (studentId: string) => {
    // console.log(`Sending reminder to student ${studentId}`);
    // Implement reminder logic here
  };

  const groupedStudents = useMemo(() => {
    return groupByDate(students, (s) => s.submittedAt || s.lastActive);
  }, [students]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#19202b]">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

      <div className="space-y-5">
        {groupedStudents.map((group) => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {group.label}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {group.items.length}
              </span>
            </div>
            <div className="space-y-3">
              {group.items.map((student) => {
                const pill = showScore && typeof student.score === 'number'
                  ? computeGradePill(student.score, gradingSystem)
                  : null;
                return (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{ backgroundImage: `url(${student.avatar})` }}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {student.name}
                      </span>
                    </div>

                    {showScore && typeof student.score === 'number' && pill && (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${pill.bg} ${pill.color}`} title={pill.remark || pill.label}>
                          {pill.label}
                        </span>
                        <span className={`text-sm font-bold ${pill.color}`}>
                          {student.score}%
                        </span>
                      </div>
                    )}

                    {showReminderButton && (
                      <button
                        onClick={() => handleSendReminder(student.id)}
                        className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-8 px-3 bg-gray-200/80 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-medium hover:bg-gray-300/80 dark:hover:bg-white/20 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Reminder</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
