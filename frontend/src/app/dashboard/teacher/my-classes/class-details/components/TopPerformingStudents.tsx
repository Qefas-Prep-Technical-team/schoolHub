import { Trophy, TrendingUp } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  rank: number;
  score: number;
  avatar: string;
  improvement: string;
}

interface TopPerformingStudentsProps {
  students: Student[];
  onViewAll: () => void;
}

export default function TopPerformingStudents({ students, onViewAll }: TopPerformingStudentsProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 dark:text-yellow-400';
      case 2:
        return 'text-gray-500 dark:text-gray-400';
      case 3:
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-400 dark:text-gray-500';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Performing Students
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Student Avatar and Rank */}
              <div className="relative">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(student.rank)}`}>
                  {getRankIcon(student.rank)}
                </div>
              </div>

              {/* Student Info */}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.name}
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    student.improvement.startsWith('+')
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {student.improvement}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Trophy className="w-3 h-3" />
                  <span>Rank {student.rank}</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className={`text-lg font-bold ${
                student.score >= 90 ? 'text-green-600 dark:text-green-400' :
                student.score >= 80 ? 'text-blue-600 dark:text-blue-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {student.score}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Average Score
              </p>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
        </div>
      )}
    </div>
  );
}