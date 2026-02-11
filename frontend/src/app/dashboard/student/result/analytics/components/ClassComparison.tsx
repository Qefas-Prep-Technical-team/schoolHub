import { ComparisonSubject } from './types';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';

interface ClassComparisonProps {
  subjects: ComparisonSubject[];
}

export default function ClassComparison({ subjects }: ClassComparisonProps) {
  return (
    <Card className="lg:col-span-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Class Average Comparison
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        How your scores compare to the class average in key subjects.
      </p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-4">
        {subjects.map((subject) => (
          <div key={subject.name} className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {subject.name}
            </p>
            {/* Class Average Bar */}
            <ProgressBar
              value={subject.classAverage}
              color="gray"
              variant="light"
            />
            {/* Your Score Bar */}
            <ProgressBar
              value={subject.yourScore}
              color="primary"
              variant="light"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Your Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Class Average</span>
        </div>
      </div>
    </Card>
  );
}