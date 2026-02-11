'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { assignment: 'Lab 1', score: 18 },
  { assignment: 'Lab 2', score: 15 },
  { assignment: 'Lab 3', score: 20 },
  { assignment: 'Lab 4', score: 17 },
  { assignment: 'Lab 5', score: 19 },
];

export default function PerformanceChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-bold text-[#333333] dark:text-white">
        Your Assignment Performance Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
            <XAxis dataKey="assignment" stroke="#8884d8" className="dark:text-white" />
            <YAxis stroke="#8884d8" className="dark:text-white" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#FF7F50"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
