'use client';

import { Send } from 'lucide-react';
import { Student } from './types';


interface StudentListProps {
  title: string;
  students: Student[];
  showScore?: boolean;
  showReminderButton?: boolean;
}

export default function StudentList({
  title,
  students,
  showScore = false,
  showReminderButton = false,
}: StudentListProps) {
  const handleSendReminder = (studentId: string) => {
    console.log(`Sending reminder to student ${studentId}`);
    // Implement reminder logic here
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#19202b]">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      
      <div className="space-y-4">
        {students.map((student) => (
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

            {showScore && student.score && (
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {student.score}%
              </span>
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
        ))}
      </div>
    </div>
  );
}