'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  centerLabel?: {
    title: string;
    value: string;
  };
}

export default function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 80,
  showTooltip = true,
  centerLabel,
}: DonutChartProps) {
  return (
    <div className="relative size-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            cornerRadius={8}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
        </PieChart>
      </ResponsiveContainer>
      
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="block text-3xl font-bold text-slate-900 dark:text-white">
            {centerLabel.value}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {centerLabel.title}
          </span>
        </div>
      )}
    </div>
  );
}