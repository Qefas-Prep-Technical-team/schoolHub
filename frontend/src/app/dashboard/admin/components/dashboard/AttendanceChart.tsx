/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Calendar, AlertTriangle, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import BarChart from './BarChart';

export default function AttendanceChart() {
  const [period, setPeriod] = useState('This Week');
  const [attendanceData] = useState<any>([
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 92 },
    { day: 'Wed', value: 88 },
    { day: 'Thu', value: 96 },
    { day: 'Fri', value: 78 },
  ]);

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-6 w-6 text-teal-600" />
          Attendance Overview
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-medium rounded-lg py-2 px-3 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary/20"
        >
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[200px]">
        <BarChart data={attendanceData} color="#3B82F6" height={200} />
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Weekly Avg</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">87.8%</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Best Day</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">96%</p>
          <p className="text-xs text-slate-500">Thursday</p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">Lowest Day</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">78%</p>
          <p className="text-xs text-slate-500">Friday</p>
        </div>
      </div>

      {/* Alert */}
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Low Attendance Alert
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Grade 9-C showing consistent low attendance
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">78%</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              15% below average
            </p>
          </div>
        </div>
        <button className="mt-3 text-xs font-semibold text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
          Review Class Attendance →
        </button>
      </div>
    </div>
  );
}