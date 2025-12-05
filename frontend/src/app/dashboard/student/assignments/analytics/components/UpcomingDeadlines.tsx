import { Deadline } from './types';
import Card from './ui/Card';

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

export default function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const getStatusColor = (status: Deadline['status']) => {
    switch (status) {
      case 'in-progress':
        return 'text-orange-600 dark:text-orange-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="mt-8">
      <h2 className="px-4 pb-3 pt-5 text-[22px] font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
        Upcoming Deadlines
      </h2>
      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <Card key={deadline.id}>
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 items-center justify-center rounded-lg bg-${deadline.iconColor}-100 dark:bg-${deadline.iconColor}-900/50`}
              >
                <span className={`material-symbols-outlined text-${deadline.iconColor}-600 dark:text-${deadline.iconColor}-400`}>
                  {deadline.icon}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{deadline.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{deadline.dueIn}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-sm font-semibold ${getStatusColor(deadline.status)}`}>
                  {deadline.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}