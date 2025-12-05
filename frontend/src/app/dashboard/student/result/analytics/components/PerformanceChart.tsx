'use client';

import { useState } from 'react';
import Card from './ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';
import { performanceData } from '@/lib/data';

export default function PerformanceChart() {
  const [viewType, setViewType] = useState<'trend' | 'detailed'>('trend');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.term}</p>
          <p className="text-primary">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="lg:col-span-3">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Trend
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your average score term-over-term.
        </p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="#9ca3af" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="term" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3670e2"
              strokeWidth={3}
              dot={({ cx, cy, payload }) => (
                <g key={payload.term}>
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="5" 
                    fill="#3670e2" 
                    stroke="white" 
                    strokeWidth="2"
                  />
                </g>
              )}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#3670e2' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-around mt-2">
        {performanceData.map((data) => (
          <p key={data.term} className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
            {data.term}
          </p>
        ))}
      </div>
    </Card>
  );
}