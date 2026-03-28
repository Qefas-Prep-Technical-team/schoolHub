import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 ${className}`}>
      <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal">
        {title}
      </p>
      <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
        {value}
      </p>
    </div>
  );
};

export default StatsCard;