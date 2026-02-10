'use client';

import { useEffect, useState } from 'react';

interface CircularChartProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  label?: string;
}

export default function CircularChart({
  value,
  size = 'lg',
  strokeWidth = 2.5,
  color = '#356fe3',
  bgColor = '#e8ebf3',
  showValue = true,
  label = 'Present',
}: CircularChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48 md:w-56 md:h-56',
    xl: 'w-64 h-64',
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-5xl md:text-6xl',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(animatedValue / 100) * circumference} ${circumference}`;

  return (
    <div className={`relative ${sizeClasses[size]} shrink-0`}>
      <svg className="circular-chart w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        {/* Background Circle */}
        <path
          className="circle-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle */}
        <path
          className="circle"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={strokeDasharray}
          style={{
            transition: 'stroke-dasharray 1s ease-out',
          }}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${textSizes[size]} font-black text-gray-900 dark:text-white tracking-tighter`}>
            {value}%
          </span>
          <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}