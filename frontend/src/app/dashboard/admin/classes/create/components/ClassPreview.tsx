import React from 'react';
import { School, Users } from 'lucide-react';

interface ClassPreviewProps {
  className: string;
  academicSession: string;
  teacher: string;
  capacity: number;
  subjects: string[];
}

const ClassPreview: React.FC<ClassPreviewProps> = ({
  className = "Grade 5 - Section A",
  academicSession = "2024-2025",
  teacher = "Dr. Eleanor Vance",
  capacity = 30,
  subjects = ["Mathematics", "Science", "English", "History", "Art"]
}) => {
  return (
    <div className="lg:col-span-1 sticky top-10">
      <div className="bg-white dark:bg-[#1C2532] dark:border dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-slate-900 dark:text-white font-bold mb-4">Class Preview</h3>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="text-slate-900 dark:text-white font-bold text-lg">{className}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{academicSession} Session</p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <School className="text-slate-500 dark:text-slate-400 text-xl" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Teacher:</span> {teacher}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-slate-500 dark:text-slate-400 text-xl" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Capacity:</span> {capacity} Students
                </p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subjects:</p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <span
                    key={subject}
                    className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPreview;