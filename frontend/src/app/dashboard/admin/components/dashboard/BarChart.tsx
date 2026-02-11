'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: {
    name: string;
    value: number;
  }[];
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  height?: number;
}

export default function BarChart({
  data,
  color = '#3B82F6',
  showGrid = true,
  showTooltip = true,
  height = 300,
}: BarChartProps) {
  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />}
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            domain={[0, 100]}
          />
          {showTooltip && (
            <Tooltip
              formatter={(value) => [`${value}%`, 'Value']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
          )}
          <Bar 
            dataKey="value" 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}