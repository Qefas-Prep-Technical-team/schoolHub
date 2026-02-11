/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const performanceData = [
  { month: 'Jan', average: 72, top: 92, low: 62 },
  { month: 'Feb', average: 75, top: 94, low: 65 },
  { month: 'Mar', average: 78, top: 96, low: 68 },
  { month: 'Apr', average: 82, top: 98, low: 72 },
  { month: 'May', average: 85, top: 100, low: 75 },
  { month: 'Jun', average: 80, top: 95, low: 70 },
];

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');

  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Performance Analytics
        </h2>
        
        <div className="flex gap-2">
          {['week', 'month', 'semester'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280" 
              fontSize={12} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              domain={[50, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Score']}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#E5E7EB',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="#3670e2"
              fill="url(#colorAverage)"
              strokeWidth={2}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="top"
              stroke="#10b981"
              fill="url(#colorTop)"
              strokeWidth={2}
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#ef4444"
              fill="url(#colorLow)"
              strokeWidth={2}
              fillOpacity={0.2}
            />
            <defs>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3670e2" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3670e2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary rounded-full"></div>
          <span>Class Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500 rounded-full"></div>
          <span>Top Scores</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500 rounded-full"></div>
          <span>Low Scores</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Avg.</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">82%</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvement</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">+10%</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Consistency</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">High</p>
        </div>
      </div>
    </div>
  );
}