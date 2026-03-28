// app/components/StatsCards.tsx
import { StatCard } from './types';

const stats: StatCard[] = [
  { label: 'Present', value: '18', color: 'present' },
  { label: 'Absent', value: '2', color: 'absent' },
  { label: 'Late', value: '1', color: 'late' },
  { label: 'Excused', value: '1', color: 'excused' }
];

export default function StatsCards() {
  const getTextColor = (color: StatCard['color']): string => {
    const colors: Record<StatCard['color'], string> = {
      present: 'text-present',
      absent: 'text-absent',
      late: 'text-late',
      excused: 'text-excused'
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat: StatCard, index: number) => (
        <div 
          key={index}
          className="flex flex-col gap-2 rounded-xl p-6 border border-[#d0d7e7] dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <p className="text-[#0e121b] dark:text-gray-200 text-base font-medium leading-normal">
            {stat.label}
          </p>
          <p className={`${getTextColor(stat.color)} tracking-light text-3xl font-bold leading-tight`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}