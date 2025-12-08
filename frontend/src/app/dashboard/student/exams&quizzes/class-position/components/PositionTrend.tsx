// src/components/Dashboard/PositionTrend.tsx
import React from 'react';
import { TrendData } from './types';

const trendData: TrendData[] = [
    { term: 'Term 1', position: 9, height: '60%', isCurrent: false },
    { term: 'Term 2', position: 8, height: '55%', isCurrent: false },
    { term: 'This Term', position: 7, height: '45%', isCurrent: true },
];

const PositionTrend: React.FC = () => {
    return (
        <div className="bg-white dark:bg-[#1C2431] rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0e121b] dark:text-white mb-4">
                Position Trend
            </h3>
            <div className="flex items-end justify-between h-40 space-x-2">
                {trendData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                        <div
                            className={`w-full rounded-t-md ${data.isCurrent ? 'bg-primary' : 'bg-primary/20'
                                }`}
                            style={{ height: data.height }}
                        ></div>
                        <div className={`text-xs text-center mt-1 ${data.isCurrent ? 'font-bold text-primary' : 'text-[#506795] dark:text-gray-400'
                            }`}>
                            {data.term}
                        </div>
                        <div className={`text-xs text-center font-bold ${data.isCurrent ? 'text-primary' : 'text-[#0e121b] dark:text-gray-300'
                            }`}>
                            {data.position}th
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PositionTrend;