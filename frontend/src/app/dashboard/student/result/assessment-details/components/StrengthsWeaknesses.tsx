import { FeedbackItem } from './types';
import Card from './ui/Card';

interface StrengthsWeaknessesProps {
  strengths: FeedbackItem[];
  improvements: FeedbackItem[];
}

export default function StrengthsWeaknesses({ strengths, improvements }: StrengthsWeaknessesProps) {
  return (
    <Card className="sticky top-8">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Strengths</h3>
        <ul className="space-y-3">
          {strengths.map((strength) => (
            <li key={strength.id} className="flex items-start gap-3">
              <span className={`material-symbols-outlined mt-0.5 ${strength.iconColor}`}>
                {strength.icon}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {strength.content}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Areas for Improvement</h3>
        <ul className="space-y-3">
          {improvements.map((improvement) => (
            <li key={improvement.id} className="flex items-start gap-3">
              <span className={`material-symbols-outlined mt-0.5 ${improvement.iconColor}`}>
                {improvement.icon}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {improvement.content}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}