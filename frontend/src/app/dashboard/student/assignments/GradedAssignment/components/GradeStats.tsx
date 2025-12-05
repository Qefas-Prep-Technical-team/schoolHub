interface GradeStat {
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

interface GradeStatsProps {
  stats: GradeStat[];
}

export default function GradeStats({ stats }: GradeStatsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="text-base font-medium text-[#888888] dark:text-gray-400">{stat.label}</p>
          <p className={`text-3xl font-bold leading-tight ${stat.color || 'text-primary'}`}>
            {stat.value}
          </p>
          {stat.subtext && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}