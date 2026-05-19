import React from 'react';
import { AttendanceSummary } from './types';

interface AttendanceSummaryCardProps {
  summary: AttendanceSummary;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  isLoading?: boolean;
}

const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({ 
  summary, 
  selectedMonth,
  onMonthChange,
  isLoading
}) => {
  const rateVal = summary.rate !== undefined ? summary.rate : (summary.attendanceRate !== undefined ? summary.attendanceRate : 0);
  const presentVal = summary.present ?? 0;
  const absentVal = summary.absent ?? 0;
  const lateVal = summary.late ?? 0;

  const stats = [
    {
      label: 'Overall Attendance',
      value: `${typeof rateVal === 'number' ? rateVal.toFixed(1) : rateVal}%`,
      color: 'blue',
      icon: '📊'
    },
    {
      label: 'Total Present',
      value: presentVal.toLocaleString(),
      color: 'green',
      icon: '✅'
    },
    {
      label: 'Total Absent',
      value: absentVal.toLocaleString(),
      color: 'red',
      icon: '❌'
    },
    {
      label: 'Total Late',
      value: lateVal.toLocaleString(),
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

  const months = React.useMemo(() => {
    const list = [];
    const currentDate = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${monthNames[month]} ${year}`;
      list.push({ value, label });
    }
    return list;
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
        <select 
          value={selectedMonth}
          onChange={(e) => onMonthChange?.(e.target.value)}
          className="form-select text-sm rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary text-gray-800 dark:text-gray-250"
          disabled={isLoading}
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg transition-all duration-355 ${colorClasses[stat.color as keyof typeof colorClasses]}`}
          >
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700/60 rounded w-4/5"></div>
                <div className="h-7 bg-gray-400 dark:bg-gray-600/60 rounded w-3/5 mt-1"></div>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${valueClasses[stat.color as keyof typeof valueClasses]}`}>
                  {stat.value}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummaryCard;