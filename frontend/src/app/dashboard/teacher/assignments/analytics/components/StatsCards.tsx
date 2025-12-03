import { StatsCard } from "./types";


interface StatsCardsProps {
  stats: StatsCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#19202b] p-6 border border-gray-200 dark:border-gray-800"
        >
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">
            {stat.title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stat.value}
          </p>
          {stat.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {stat.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}