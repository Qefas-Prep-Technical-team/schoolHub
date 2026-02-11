import Button from './ui/Button';
import { Eye } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  submittedDate: string;
  teacher: string;
  onViewAnswers?: () => void;
}

export default function PageHeader({ 
  title, 
  submittedDate, 
  teacher,
  onViewAnswers 
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white md:text-4xl">
          {title}
        </p>
        <p className="text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
          Submitted on {submittedDate} | Teacher: {teacher}
        </p>
      </div>
      <Button
        icon={<Eye className="h-4 w-4" />}
        onClick={onViewAnswers}
      >
        View Corrected Answers
      </Button>
    </div>
  );
}