import { SubjectPerformance } from './types';
import Card from './ui/Card';

interface StrengthsWeaknessesProps {
  title: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  subjects: SubjectPerformance[];
}

export default function StrengthsWeaknesses({
  title,
  icon,
  iconBgColor,
  iconColor,
  subjects,
}: StrengthsWeaknessesProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          <span className={`material-symbols-outlined ${iconColor}`}>
            {icon}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <ul className="space-y-4">
        {subjects.map((subject) => (
          <li key={subject.subject} className="flex justify-between items-center">
            <p className="text-gray-700 dark:text-gray-300">{subject.subject}</p>
            <p className="font-bold text-gray-900 dark:text-white">{subject.score}%</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}