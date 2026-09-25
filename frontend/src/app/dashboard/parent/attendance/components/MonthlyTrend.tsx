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
  period?: string;
  onPeriodChange?: (period: string) => void;
  trendText?: string;
}

export default function MonthlyTrend({ 
  data, 
  title = 'Attendance Trend',
  period = 'This Semester',
  onPeriodChange,
  trendText = 'Average attendance is stable'
}: MonthlyTrendProps) {
  const periods = ['This Semester', 'Last Month', 'Last 3 Months'];

  // Find max attendance for scaling
  const maxAttendance = Math.max(100, ...data.map(item => item.attendance));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <select
          value={period}
          onChange={(e) => onPeriodChange?.(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          {periods.map((p) => (
            <option key={p} value={p} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Line Chart */}
      <div className="relative h-40 w-full mt-8 mb-6 px-4">
        {data.length > 0 && (
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw area under line */}
            <path
              d={`M 0 100 L ${data.map((d, i) => {
                const x = (i / Math.max(1, data.length - 1)) * 100;
                const y = 100 - (d.attendance / maxAttendance) * 100;
                return `${x} ${y}`;
              }).join(' L ')} L 100 100 Z`}
              className="fill-orange-500/10 dark:fill-orange-500/5"
            />
            {/* Draw line */}
            <path
              d={`M ${data.map((d, i) => {
                const x = (i / Math.max(1, data.length - 1)) * 100;
                const y = 100 - (d.attendance / maxAttendance) * 100;
                return `${x} ${y}`;
              }).join(' L ')}`}
              fill="none"
              className="stroke-orange-500 dark:stroke-orange-400"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        
        {/* Tooltips, Dots, and X-axis labels */}
        <div className="absolute inset-0 pointer-events-none">
          {data.map((item, i) => {
            const x = (i / Math.max(1, data.length - 1)) * 100;
            const y = 100 - (item.attendance / maxAttendance) * 100;
            return (
              <div 
                key={item.month} 
                className="absolute inset-y-0 flex flex-col group cursor-pointer pointer-events-auto"
                style={{ left: `${x}%`, width: '1px' }}
              >
                {/* Hover target area */}
                <div className="absolute inset-y-0 -left-6 w-12 z-10" />
                
                {/* Fixed Circular Dot */}
                <div 
                  className="absolute w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-orange-500 dark:border-orange-400 -translate-x-1/2 -translate-y-1/2 z-20 group-hover:scale-125 transition-transform duration-200 shadow-sm"
                  style={{ top: `${y}%` }}
                />

                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 whitespace-nowrap z-30 shadow-sm font-semibold pointer-events-none transform group-hover:-translate-y-1">
                  {item.attendance}%
                </div>
                
                {/* Vertical dash line on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute inset-y-0 w-px border-l border-dashed border-orange-300 dark:border-orange-500/50 -translate-x-1/2 transition-opacity duration-200" />
                
                {/* X-axis label */}
                <span className={`absolute -bottom-8 -translate-x-1/2 text-xs font-semibold whitespace-nowrap ${
                  item.isCurrent ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {trendText}
          </p>
        </div>
      </div>
    </div>
  );
}
