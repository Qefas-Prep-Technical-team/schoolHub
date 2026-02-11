import { CheckCircle, UserPlus, Database, TrendingUp } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export default function RecentActivity() {
  const activities: Activity[] = [
    {
      id: '1',
      time: '10 mins ago',
      description: 'Mrs. Krabappel published Grade 4 Math results.',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    {
      id: '2',
      time: '45 mins ago',
      description: 'New student Bart Simpson enrolled in Grade 4.',
      icon: UserPlus,
      iconColor: 'text-blue-500',
    },
    {
      id: '3',
      time: '2 hours ago',
      description: 'System backup completed successfully.',
      icon: Database,
      iconColor: 'text-slate-400',
    },
    {
      id: '4',
      time: '5 hours ago',
      description: 'Grade 10 Science scores improved by 15%.',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-xs font-semibold text-primary hover:underline">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
              <div className={`${activity.iconColor} p-2 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}