import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentHeaderProps {
  title: string;
  submittedDate: Date;
  gradedDate: Date;
  status: 'graded' | 'pending' | 'submitted';
}

export default function AssignmentHeader({
  title,
  submittedDate,
  gradedDate,
  status,
}: AssignmentHeaderProps) {
  const statusConfig = {
    graded: {
      icon: <CheckCircle className="h-4 w-4 text-[#7ED321]" />,
      text: 'Graded',
      className: 'bg-[#7ED321]/20 text-[#7ED321]',
    },
    pending: {
      icon: null,
      text: 'Pending',
      className: 'bg-yellow-500/20 text-yellow-500',
    },
    submitted: {
      icon: null,
      text: 'Submitted',
      className: 'bg-blue-500/20 text-blue-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#333333] dark:text-white md:text-4xl">
          {title}
        </h1>
        <p className="text-base text-[#888888] dark:text-gray-400">
          Submitted On: {format(submittedDate, 'MMM d, yyyy')} | Graded On:{' '}
          {format(gradedDate, 'MMM d, yyyy')}
        </p>
      </div>
      <div
        className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-3 py-1 ${config.className}`}
      >
        {config.icon}
        <p className="text-sm font-medium leading-normal">{config.text}</p>
      </div>
    </div>
  );
}