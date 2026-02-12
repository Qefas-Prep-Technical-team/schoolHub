import { StatCard } from './types';
import Card from './ui/Card';

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const getTrendColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 dark:text-green-500';
      case 'primary':
        return 'text-primary';
      case 'red':
        return 'text-red-600 dark:text-red-500';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            {stat.trend && (
              <p className={`text-sm font-medium flex items-center gap-1 ${getTrendColor(stat.trend.color)}`}>
                <span className="material-symbols-outlined text-base">{stat.trend.icon}</span>
                {stat.trend.value}
              </p>
            )}
          </div>
        </Card>
      ))}
    </>
  );
}