// app/components/StatsCards.tsx

import { StatCard } from "./types";


const stats: StatCard[] = [
  { label: 'Total Merits', value: 12 },
  { label: 'Total Demerits', value: 3 },
  { label: 'Open Incidents', value: 1 }
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat: StatCard, index: number) => (
        <div 
          key={index}
          className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {stat.label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}