import { StatsCard } from "./types";
import { computeGradePill } from "@/utils/gradingSystem";


interface StatsCardsProps {
  stats: StatsCard[];
  gradingSystem?: any[] | null;
}

export default function StatsCards({ stats, gradingSystem }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      {stats.map((stat, index) => {
        const pill = typeof stat.numericScore === 'number'
          ? computeGradePill(stat.numericScore, gradingSystem)
          : null;
        return (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#19202b] p-6 border border-gray-200 dark:border-gray-800"
          >
            <p className="text-base font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </p>
            <div className="flex items-center gap-2.5">
              <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {stat.value}
              </p>
              {pill && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${pill.bg} ${pill.color}`}
                  title={pill.remark || pill.label}
                >
                  {pill.label}
                </span>
              )}
            </div>
            {stat.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stat.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
