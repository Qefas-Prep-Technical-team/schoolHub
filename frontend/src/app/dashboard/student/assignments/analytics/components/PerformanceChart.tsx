/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Card from './ui/Card';
import { performanceData } from './data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';

export default function PerformanceChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Semester');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.month}</p>
          <p className="text-primary">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col gap-2">
      <p className="text-base font-medium leading-normal text-gray-900 dark:text-white">
        Performance Trend
      </p>
      <p className="truncate text-[32px] font-bold leading-tight tracking-light text-gray-900 dark:text-white">
        88%
      </p>
      <div className="flex gap-1">
        <p className="text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
          {selectedPeriod}
        </p>
        <p className="text-base font-medium leading-normal text-green-600 dark:text-green-500">
          +2%
        </p>
      </div>
      <div className="h-[180px] w-full py-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2b6cee" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2b6cee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="score" stroke="none" fill="url(#gradient)" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2b6cee"
              strokeWidth={3}
              dot={{ strokeWidth: 3, r: 4, stroke: '#2b6cee', fill: 'white' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#2b6cee' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}