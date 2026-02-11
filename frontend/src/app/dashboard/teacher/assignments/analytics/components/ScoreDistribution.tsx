'use client';

import { DistributionData } from "./types";


interface ScoreDistributionProps {
  data: DistributionData[];
}

export default function ScoreDistribution({ data }: ScoreDistributionProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#19202b] lg:col-span-2">
      <div className="flex flex-col">
        <p className="text-base font-medium text-gray-900 dark:text-white">
          Score Distribution
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">25 students graded</p>
      </div>

      <div className="grid h-64 grid-flow-col auto-cols-fr gap-4 items-end justify-items-center px-3">
        {data.map((item, index) => {
          const isHighlighted = item.range === '70-79' || item.range === '80-89';
          
          return (
            <div key={index} className="flex flex-col items-center gap-2 w-full">
              <div
                className={`w-full rounded ${
                  isHighlighted
                    ? 'bg-primary'
                    : 'bg-primary/30 dark:bg-primary/40'
                }`}
                style={{ height: `${item.percentage}%` }}
              />
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                {item.range}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {item.count} students
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}