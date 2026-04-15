interface AttendanceData {
  overallPercentage: number;
  present: number;
  absent: number;
  late: number;
  trend: string;
}

interface AttendanceSummaryProps {
  data: AttendanceData;
  onViewAll: () => void;
}

export default function AttendanceSummary({ data, onViewAll }: AttendanceSummaryProps) {
  const circumference = 2 * Math.PI * 40; // r = 40
  const strokeDashoffset = circumference - (data.overallPercentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Attendance Summary
        </h2>
        <button
          onClick={onViewAll}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="40"
                fill="transparent"
                stroke="#E5E7EB"
                strokeWidth="8"
                className="dark:stroke-gray-600"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="40"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.overallPercentage}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall</p>
              <p className="text-xs text-green-500 mt-1">{data.trend}</p>
            </div>
          </div>
        </div>

        {/* Stats Breakdown */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Present
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.present}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">students</p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Absent
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.absent}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">students</p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Late
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.late}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">students</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Perfect Attendance
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.present - data.late}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">students</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}