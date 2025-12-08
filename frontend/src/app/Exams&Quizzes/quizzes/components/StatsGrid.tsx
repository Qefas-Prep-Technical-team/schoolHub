// src/components/Dashboard/StatsGrid.tsx
import React from 'react';
import { QuizStat } from './types';
import StatCard from './ui/StatCard';


const StatsGrid: React.FC = () => {
    const stats: QuizStat[] = [
        { icon: 'quiz', value: 20, label: 'Questions' },
        { icon: 'emoji_events', value: 100, label: 'Total Points' },
        { icon: 'hourglass_top', value: '25m', label: 'Est. Time' },
        { icon: 'signal_cellular_alt', value: 'Medium', label: 'Difficulty' },
        { icon: 'replay', value: 3, label: 'Attempts' }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default StatsGrid;