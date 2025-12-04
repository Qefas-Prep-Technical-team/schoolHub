import { Calendar, ArrowRight } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project';
  date: string;
  description: string;
  status: 'upcoming' | 'overdue' | 'completed';
  icon: string;
  color: 'yellow' | 'orange' | 'red' | 'blue' | 'green';
}

interface UpcomingActivitiesProps {
  activities: Activity[];
  onViewAll: () => void;
}

export default function UpcomingActivities({ activities, onViewAll }: UpcomingActivitiesProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'orange':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'red':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'blue':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'green':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBadge = (status: Activity['status']) => {
    switch (status) {
      case 'upcoming':
        return <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">Upcoming</span>;
      case 'overdue':
        return <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">Overdue</span>;
      case 'completed':
        return <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Upcoming Activities
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(activity.color)}`}>
                <span className="material-symbols-outlined text-xl">
                  {activity.icon}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.date}
                  </span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
            <button className="text-sm text-primary hover:text-primary/80 font-medium hover:underline">
              {activity.status === 'completed' ? 'Review' : 'View Details'}
            </button>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No upcoming activities</p>
        </div>
      )}
    </div>
  );
}