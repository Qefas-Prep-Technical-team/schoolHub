import { StatCard } from './types';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Card from './ui/Card';

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const getChangeIcon = (type: StatCard['changeType']) => {
    switch (type) {
      case 'positive':
        return <ArrowUp className="h-3 w-3" />;
      case 'negative':
        return <ArrowDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getChangeColor = (type: StatCard['changeType']) => {
    switch (type) {
      case 'positive':
        return 'text-green-600 dark:text-green-500';
      case 'negative':
        return 'text-orange-600 dark:text-orange-500';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} padding="lg">
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium leading-normal text-gray-800 dark:text-gray-200">
              {stat.title}
            </p>
            <p className="text-3xl font-bold leading-tight tracking-light text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className={`text-sm font-medium leading-normal ${getChangeColor(stat.changeType)}`}>
              <span className="inline-flex items-center gap-1">
                {getChangeIcon(stat.changeType)}
                {stat.change}
              </span>
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}