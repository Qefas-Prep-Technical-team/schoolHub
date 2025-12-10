import React from 'react';
import { AttendanceSummary } from './types';

interface AttendanceSummaryCardProps {
  summary: AttendanceSummary;
  onMonthChange?: (month: string) => void;
}

const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({ 
  summary, 
  onMonthChange 
}) => {
  const stats = [
    {
      label: 'Overall Attendance',
      value: `${summary.attendanceRate}%`,
      color: 'blue',
      icon: '📊'
    },
    {
      label: 'Total Present',
      value: summary.present.toLocaleString(),
      color: 'green',
      icon: '✅'
    },
    {
      label: 'Total Absent',
      value: summary.absent.toLocaleString(),
      color: 'red',
      icon: '❌'
    },
    {
      label: 'Total Late',
      value: summary.late.toLocaleString(),
      color: 'yellow',
      icon: '⏰'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300'
  };

  const valueClasses = {
    blue: 'text-blue-800 dark:text-blue-200',
    green: 'text-green-800 dark:text-green-200',
    red: 'text-red-800 dark:text-red-200',
    yellow: 'text-yellow-800 dark:text-yellow-200'
  };

  return (
    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
        <select 
          onChange={(e) => onMonthChange?.(e.target.value)}
          className="form-select text-sm rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"
        >
          <option value="2023-10">October 2023</option>
          <option value="2023-09">September 2023</option>
          <option value="2023-08">August 2023</option>
          <option value="2023-07">July 2023</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}
          >
            <p className="text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${valueClasses[stat.color as keyof typeof valueClasses]}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummaryCard;