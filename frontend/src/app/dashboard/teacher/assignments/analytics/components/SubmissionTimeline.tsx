'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { day: 'Day 1', submissions: 0 },
  { day: 'Day 2', submissions: 0 },
  { day: 'Day 3', submissions: 2 },
  { day: 'Day 4', submissions: 5 },
  { day: 'Day 5', submissions: 8 },
  { day: 'Day 6', submissions: 12 },
  { day: 'Day 7', submissions: 25 },
];

export default function SubmissionTimeline() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#19202b] lg:col-span-3">
      <div className="flex flex-col">
        <p className="text-base font-medium text-gray-900 dark:text-white">Submission Timeline</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Submissions leading up to the deadline</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
            <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#E5E7EB',
                borderRadius: '0.5rem',
              }}
            />
            <Area
              type="monotone"
              dataKey="submissions"
              stroke="#3670e2"
              fill="url(#colorGradient)"
              strokeWidth={3}
              fillOpacity={0.3}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3670e2" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3670e2" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}