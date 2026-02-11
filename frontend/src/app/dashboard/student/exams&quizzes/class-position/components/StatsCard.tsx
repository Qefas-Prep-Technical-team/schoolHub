// src/components/Dashboard/StatsCard.tsx
import React from 'react';
import { StatCard } from './types';

const StatsCard: React.FC<StatCard> = ({ title, value }) => {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1C2431] shadow-sm">
            <p className="text-base font-medium leading-normal text-[#506795] dark:text-gray-400">
                {title}
            </p>
            <p className="text-3xl font-bold leading-tight text-[#0e121b] dark:text-white">
                {value}
            </p>
        </div>
    );
};

export default StatsCard;