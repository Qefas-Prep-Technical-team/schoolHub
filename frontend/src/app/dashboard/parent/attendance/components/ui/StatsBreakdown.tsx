import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatItem {
  type: 'present' | 'late' | 'absent';
  label: string;
  value: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StatsBreakdownProps {
  stats: {
    presentDays: number;
    lateDays: number;
    absentDays: number;
  };
  status?: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  onViewDetails?: () => void;
}

export default function StatsBreakdown({ 
  stats, 
  status = 'excellent',
  onViewDetails 
}: StatsBreakdownProps) {
  const statItems: StatItem[] = [
    {
      type: 'present',
      label: 'Days Present',
      value: `${stats.presentDays} Days`,
      color: 'text-success',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: CheckCircle,
    },
    {
      type: 'late',
      label: 'Days Late',
      value: `${stats.lateDays} Days`,
      color: 'text-warning',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: Clock,
    },
    {
      type: 'absent',
      label: 'Days Absent',
      value: `${stats.absentDays} Days`,
      color: 'text-danger',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: XCircle,
    },
  ];

  const statusConfig = {
    excellent: {
      label: 'Excellent',
      color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    },
    good: {
      label: 'Good',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    },
    'needs-improvement': {
      label: 'Needs Improvement',
      color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    },
    poor: {
      label: 'Poor',
      color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    },
  };

  return (
    <div className="flex-1 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Semester Summary
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusConfig[status].color}`}>
          Status: {statusConfig[status].label}
        </span>
      </div>
      
      <div className="space-y-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className="flex items-center justify-between p-3 rounded-lg bg-background-light dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
      
      {onViewDetails && (
        <div className="mt-6">
          <button
            onClick={onViewDetails}
            className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            View Detailed Breakdown
          </button>
        </div>
      )}
    </div>
  );
}