// src/components/Dashboard/SubjectCard.tsx
import React from 'react';
import { SubjectData } from './types';
import CircularProgress from './CircularProgress';

const SubjectCard: React.FC<SubjectData> = ({
  name,
  percentage,
  trend,
  trendValue,
  color = '#3670e2',
  classesHeld,
  classesAttended
}) => {
  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white text-lg font-semibold">
          {name}
        </h3>
        <div className={`flex items-center gap-1 ${getTrendColor(trend)}`}>
          <span className="material-symbols-outlined text-lg">
            trending_{trend}
          </span>
          <p className="text-sm font-medium">{trendValue}</p>
        </div>
      </div>
      
      <CircularProgress 
        percentage={percentage} 
        color={color}
      />
      
      <div className="flex justify-between text-center border-t border-slate-200 dark:border-slate-800 pt-4">
        <div>
          <p className="text-slate-900 dark:text-white text-xl font-bold">
            {classesHeld}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Classes Held
          </p>
        </div>
        <div>
          <p className="text-slate-900 dark:text-white text-xl font-bold">
            {classesAttended}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Attended
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;