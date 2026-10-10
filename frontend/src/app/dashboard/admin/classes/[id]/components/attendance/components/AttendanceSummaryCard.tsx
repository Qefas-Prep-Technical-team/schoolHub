import React from 'react';
import { AttendanceSummary } from './types';
import { Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface AttendanceSummaryCardProps {
  summary: AttendanceSummary;
  selectedDate?: string;
  isLoading?: boolean;
}

const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({ 
  summary, 
  selectedDate,
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
      icon: '📊',
      info: 'Reflects the overall attendance percentage on the selected day. Consistently low rates may point to broader classroom disengagement or systemic scheduling issues.'
    },
    {
      label: 'Total Present',
      value: presentVal.toLocaleString(),
      color: 'green',
      icon: '✅',
      info: 'The absolute count of students who were marked as present. Use this alongside the total student count to gauge daily active participation.'
    },
    {
      label: 'Total Absent',
      value: absentVal.toLocaleString(),
      color: 'red',
      icon: '❌',
      info: 'The total number of students completely missing from this class. High numbers here should trigger a review of parent notifications or underlying health/environmental factors.'
    },
    {
      label: 'Total Late',
      value: lateVal.toLocaleString(),
      color: 'yellow',
      icon: '⏰',
      info: 'Tracks students who arrived after the scheduled start time. Monitoring this helps identify patterns in tardiness that could disrupt the overall learning flow.'
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Summary</h2>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Today'}
        </span>
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
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold">{stat.label}</p>
                  {stat.info && (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="opacity-70 hover:opacity-100 transition-opacity focus:outline-none">
                            <Info size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                          <p>{stat.info}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
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