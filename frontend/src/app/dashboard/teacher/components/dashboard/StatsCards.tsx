interface StatsCardsProps {
  stats: {
    totalClasses: number;
    totalStudents: number;
    upcomingLessons: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total Classes */}
      <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
              school
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Classes
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalClasses}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You teach {stats.totalClasses} different classes
        </p>
      </div>

      {/* Total Students */}
      <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">
              groups
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Students
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalStudents}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Across all your classes
        </p>
      </div>

      {/* Upcoming Lessons */}
      <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
              schedule
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Upcoming Lessons Today
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.upcomingLessons}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Scheduled for today
        </p>
      </div>
    </div>
  );
}