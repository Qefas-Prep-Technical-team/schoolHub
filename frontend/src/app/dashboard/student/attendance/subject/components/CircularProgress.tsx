// src/components/Dashboard/CircularProgress.tsx
import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#3670e2',
  showLabel = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-center relative my-2">
      <svg className="transform -rotate-90" height={size} width={size}>
        <circle
          className="text-slate-100 dark:text-slate-800"
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            strokeDashoffset: circumference - (percentage / 100) * circumference
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center">
          <span className="text-slate-900 dark:text-white text-3xl font-bold">
            {percentage}%
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            Present
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;