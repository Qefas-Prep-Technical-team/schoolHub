'use client';

import { SubjectPerformance } from './types';
import ProgressBar from './ui/ProgressBar';
import Badge from './ui/Badge';
import Link from 'next/link';

interface SubjectTableProps {
  subjects: SubjectPerformance[];
}

export default function SubjectTable({ subjects }: SubjectTableProps) {
  const getPerformanceColor = (performance: SubjectPerformance['performance']) => {
    switch (performance) {
      case 'Excellent':
        return 'green';
      case 'Good':
        return 'blue';
      case 'Average':
        return 'yellow';
      case 'Needs Work':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left font-medium tracking-wider text-text-light-secondary dark:text-dark-secondary">
                Subject
              </th>
              <th className="px-6 py-3 text-left font-medium tracking-wider text-text-light-secondary dark:text-dark-secondary">
                Latest Score
              </th>
              <th className="hidden px-6 py-3 text-left font-medium tracking-wider text-text-light-secondary dark:text-dark-secondary sm:table-cell">
                Grade
              </th>
              <th className="hidden px-6 py-3 text-left font-medium tracking-wider text-text-light-secondary dark:text-dark-secondary md:table-cell">
                Progress
              </th>
              <th className="px-6 py-3 text-left font-medium tracking-wider text-text-light-secondary dark:text-dark-secondary">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="whitespace-nowrap px-6 py-4 cu font-medium text-text-light-primary dark:text-dark-primary">
                  <Link href={"/dashboard/student/result/subject/1"}>
                  {subject.subject}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-text-light-secondary dark:text-dark-secondary">
                  {subject.score}
                </td>
                <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                  <Badge
                    color={subject.gradeColor}
                    variant="solid"
                    size="md"
                  >
                    {subject.grade}
                  </Badge>
                </td>
                <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                  <ProgressBar 
                    value={subject.progress} 
                    className="max-w-[120px]" 
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge
                    color={getPerformanceColor(subject.performance)}
                    variant="solid"
                    size="sm"
                  >
                    {subject.performance}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}