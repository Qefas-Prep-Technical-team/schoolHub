import Link from 'next/link';
import { Assessment } from './types';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface AssessmentTableProps {
  assessments: Assessment[];
  title?: string;
}

export default function AssessmentTable({ assessments, title = 'Assessment Breakdown' }: AssessmentTableProps) {
  return (
    <Card className="mb-8">
      <h2 className="mb-4 text-xl font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Assessment Name
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Score
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Weight
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment.id} className="border-b border-border-light dark:border-border-dark last:border-0">
                <td className="px-4 py-4 text-sm font-medium cursor-pointer text-text-light dark:text-text-dark">
                  <Link href={"/dashboard/student/result/assessment-details"}>
                  {assessment.name}
                  </Link>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {assessment.score}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {assessment.weight}
                </td>
                <td className="px-4 py-4 text-right">
                  <Badge variant={assessment.status}>
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}