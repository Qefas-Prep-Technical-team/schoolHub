import React from 'react';
import { TestTube2, Calculator, Globe } from 'lucide-react';

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
        return <TestTube2 className="text-xl" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upcoming Exams
      </h3>
      <div className="flex flex-col gap-4">
        {exams.map((exam) => (
          <div key={exam.id} className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
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