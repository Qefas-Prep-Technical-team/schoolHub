'use client';

interface StatItem {
  title: string;
  count: number;
  icon: string;
  color: {
    bg: string;
    text: string;
  };
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsOverview() {
  const stats: StatItem[] = [
    {
      title: 'Upcoming Exams',
      count: 3,
      icon: 'event_upcoming',
      color: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400'
      }
    },
    {
      title: 'Completed',
      count: 12,
      icon: 'check_circle',
      color: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400'
      },
      trend: {
        value: 2,
        isPositive: true
      }
    },
    {
      title: 'Missed',
      count: 0,
      icon: 'warning',
      color: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className={`size-12 rounded-full ${stat.color.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined text-2xl ${stat.color.text}`}>
              {stat.icon}
            </span>
          </div>
          
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {stat.title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.count}
              </p>
              {stat.trend && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  stat.trend.isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}