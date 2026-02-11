import { StatCard } from './types';
import Card from './ui/Card';
import { TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium leading-normal text-text-light-secondary dark:text-dark-secondary">
              {stat.title}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold tracking-tight text-text-light-primary dark:text-dark-primary">
                {stat.value}
              </p>
              {stat.trend === 'up' && (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
            </div>
            {stat.description && (
              <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                {stat.description}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}