interface ClassStatsProps {
  stats: {
    averageGrade: number;
    assignmentsCompleted: number;
    quizzesCompleted: number;
    upcomingDeadlines: number;
    participationRate: number;
  };
}

export default function ClassStats({ stats }: ClassStatsProps) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 dark:text-green-400';
    if (grade >= 80) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getParticipationColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 80) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {/* Average Grade */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Grade</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold ${getGradeColor(stats.averageGrade)}`}>
            {stats.averageGrade}%
          </p>
          <span className="text-xs text-green-500">↑ 5%</span>
        </div>
      </div>

      {/* Assignments Completed */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assignments</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.assignmentsCompleted}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">completed</span>
        </div>
      </div>

      {/* Quizzes Completed */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quizzes</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.quizzesCompleted}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">completed</span>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.upcomingDeadlines}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">deadlines</span>
        </div>
      </div>

      {/* Participation Rate */}
      <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Participation</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold ${getParticipationColor(stats.participationRate)}`}>
            {stats.participationRate}%
          </p>
          <span className="text-xs text-green-500">↑ 3%</span>
        </div>
      </div>
    </div>
  );
}