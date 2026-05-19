import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  className?: string;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, className = '', isLoading }) => {
  return (
    <div className={`flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 ${className}`}>
      {isLoading ? (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mt-1"></div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal">
            {title}
          </p>
          <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
            {value}
          </p>
        </>
      )}
    </div>
  );
};

export default StatsCard;