'use client';

interface AttendanceWidgetProps {
  data: {
    overallPercentage: number;
    classes: Array<{
      name: string;
      absences: number;
      color: string;
    }>;
  };
}

export default function AttendanceWidget({ data }: AttendanceWidgetProps) {
  const circumference = 2 * Math.PI * 56; // r = 56
  const strokeDashoffset = circumference - (data.overallPercentage / 100) * circumference;

  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Today&apos;s Attendance
      </h2>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r="56"
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="8"
              className="dark:stroke-gray-700"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r="56"
              fill="transparent"
              stroke="#10B981"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.overallPercentage}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Overall Attendance
              </p>
            </div>
          </div>
        </div>

        {/* Class Details */}
        <div className="w-full mt-6 space-y-3">
          {data.classes.map((classItem, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${classItem.color}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {classItem.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {classItem.absences} absence{classItem.absences !== 1 ? 's' : ''}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  classItem.absences <= 2 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {classItem.absences <= 2 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Present Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">8%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Absent Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}