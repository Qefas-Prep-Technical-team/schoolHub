'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface MonthlyData {
  month: string;
  attendance: number;
  isCurrent: boolean;
}

interface MonthlyTrendProps {
  data: MonthlyData[];
  title?: string;
}

export default function MonthlyTrend({ 
  data, 
  title = 'Attendance Trend' 
}: MonthlyTrendProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('This Semester');

  const periods = ['This Semester', 'Last Month', 'Last 3 Months'];

  // Find max attendance for scaling
  const maxAttendance = Math.max(...data.map(item => item.attendance));

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-transparent text-sm font-medium text-gray-500 dark:text-gray-400 focus:outline-none cursor-pointer"
        >
          {periods.map((period) => (
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between h-32 gap-2 md:gap-4 px-2">
        {data.map((item) => {
          const height = (item.attendance / maxAttendance) * 100;
          const isActive = item.attendance >= 90;
          
          return (
            <div
              key={item.month}
              className="flex flex-col items-center gap-2 flex-1 group"
            >
              <div className="relative w-full max-w-[40px] h-full">
                {/* Background Bar */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${
                    isActive 
                      ? 'bg-primary/20 dark:bg-primary/10 group-hover:bg-primary/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                  style={{ height: '100%' }}
                />
                
                {/* Foreground Bar */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${
                    isActive 
                      ? 'bg-primary dark:bg-primary/60' 
                      : 'bg-primary/40 dark:bg-primary/30'
                  }`}
                  style={{ height: `${height}%` }}
                />
                
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                  {item.attendance}%
                </div>
              </div>
              
              <span className={`text-xs font-medium ${
                item.isCurrent 
                  ? 'text-primary font-bold' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Trend Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Average attendance improved by 2% compared to last semester
          </p>
        </div>
      </div>
    </div>
  );
}