import { AssessmentStats } from './types';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface StatsCardsProps {
  stats: AssessmentStats[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium leading-normal text-gray-800 dark:text-gray-200">
              {stat.label}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold leading-tight tracking-light text-gray-900 dark:text-white">
                {stat.value}
                {stat.subValue && (
                  <span className="text-2xl text-gray-500 dark:text-gray-400">
                    {stat.subValue}
                  </span>
                )}
              </p>
              {stat.badge && (
                <Badge variant="success">
                  {stat.badge}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}