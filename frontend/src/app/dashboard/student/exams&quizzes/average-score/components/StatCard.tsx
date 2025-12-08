// src/components/Dashboard/StatCard.tsx
import React from 'react';
import { StatCardData } from './types';

const StatCard: React.FC<StatCardData> = ({ title, value, subtitle }) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-normal">
        {title}
      </p>
      <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;