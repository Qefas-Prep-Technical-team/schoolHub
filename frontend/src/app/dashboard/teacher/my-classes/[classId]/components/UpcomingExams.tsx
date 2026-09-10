import React from 'react';
import { TestTube2, Calculator, Globe, Calendar } from 'lucide-react';

interface ExamItem {
  id: string;
  subject: string;
  date: string;
  type: string;
}

interface UpcomingExamsProps {
  exams: ExamItem[];
}

const UpcomingExams: React.FC<UpcomingExamsProps> = ({ exams }) => {
  const getIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'biology':
        return <TestTube2 className="text-xl" />;
      case 'mathematics':
        return <Calculator className="text-xl" />;
      case 'geography':
        return <Globe className="text-xl" />;
      default:
        return <Calendar className="text-xl" />;
    }
  };

  if (!exams || exams.length === 0) {
    return (
      <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-3xl border border-slate-100 dark:border-emerald-800/50 shadow-sm flex flex-col items-center justify-center text-center py-10">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-emerald-500 mb-3 border border-blue-200 dark:border-blue-800">
          <Calendar size={24} className="text-emerald-500" />
        </div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No Upcoming Exams</p>
        <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 max-w-[260px] mx-auto">
          No exams are scheduled for this class at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-3xl border border-slate-100 dark:border-emerald-800/50 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upcoming Exams
      </h3>
      <div className="flex flex-col gap-4">
        {exams.map((exam) => (
          <div key={exam.id} className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-emerald-600/10 text-emerald-600 p-2 rounded-full">
              {getIcon(exam.subject)}
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {exam.subject} {exam.type}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {exam.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingExams;