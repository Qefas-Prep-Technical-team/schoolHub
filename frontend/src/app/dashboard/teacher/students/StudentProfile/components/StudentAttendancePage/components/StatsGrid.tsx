
import StatCardItem from './StatCardItem';
import { StatCard } from './types';

const StatsGrid: React.FC = () => {
  const stats: StatCard[] = [
    {
      count: 18,
      label: 'Days Present',
      status: 'present',
      icon: 'check_circle'
    },
    {
      count: 2,
      label: 'Days Late',
      status: 'late',
      icon: 'schedule'
    },
    {
      count: 1,
      label: 'Days Absent',
      status: 'absent',
      icon: 'cancel'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <StatCardItem key={stat.status} stat={stat} />
      ))}
    </div>
  );
};

export default StatsGrid;