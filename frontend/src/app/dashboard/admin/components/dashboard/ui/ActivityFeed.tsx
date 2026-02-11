import { CheckCircle, UserPlus, Database } from 'lucide-react';

interface ActivityItem {
  id: string;
  time: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export default function ActivityFeed() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      time: '10 mins ago',
      description: 'Mrs. Krabappel published Grade 4 Math results.',
      icon: CheckCircle,
      iconColor: 'bg-emerald-500',
    },
    {
      id: '2',
      time: '45 mins ago',
      description: 'New student Bart Simpson enrolled in Grade 4.',
      icon: UserPlus,
      iconColor: 'bg-blue-500',
    },
    {
      id: '3',
      time: '2 hours ago',
      description: 'System backup completed successfully.',
      icon: Database,
      iconColor: 'bg-slate-400',
    },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      
      <div className="space-y-4 relative before:absolute before:left-[15px] before:top-2 before:h-[90%] before:w-px before:bg-slate-200 dark:before:bg-slate-700">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="relative pl-8">
              <div className="absolute left-0 top-1 size-8 bg-surface-light dark:bg-surface-dark flex items-center justify-center z-10">
                <div className={`${activity.iconColor} size-2 rounded-full ring-4 ring-white dark:ring-slate-800`} />
              </div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">
                {activity.time}
              </p>
              <p className="text-sm text-slate-800 dark:text-slate-200">
                {activity.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}