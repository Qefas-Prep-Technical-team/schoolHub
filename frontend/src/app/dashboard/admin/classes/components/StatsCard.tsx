import { cn } from '@/lib/utils';
import { Card } from './ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  className = '',
}: StatsCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-gray-600 dark:text-gray-300">
          {title}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <div className={cn(
            'flex items-center gap-1 text-base font-medium',
            changeType === 'increase' 
              ? 'text-green-500' 
              : 'text-red-500'
          )}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{change}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}