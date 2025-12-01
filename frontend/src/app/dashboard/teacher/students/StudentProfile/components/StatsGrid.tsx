import StatCard from "./StatCard";
import { StatCardT } from "./types";


const StatsGrid: React.FC = () => {
  const stats: StatCardT[] = [
    {
      title: 'Overall Grade',
      value: '88%',
      subtitle: '+2% this term',
      trend: { direction: 'up', value: '+2%' },
      status: 'success'
    },
    {
      title: 'Attendance',
      value: '95%',
      subtitle: '-1% this month',
      trend: { direction: 'down', value: '-1%' },
      status: 'danger'
    },
    {
      title: 'Overdue Assignments',
      value: 2,
      subtitle: 'Needs attention',
      status: 'warning'
    },
    {
      title: 'Recent Behavior Notes',
      value: 1,
      subtitle: 'Positive note added',
      status: 'neutral'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
};

export default StatsGrid;