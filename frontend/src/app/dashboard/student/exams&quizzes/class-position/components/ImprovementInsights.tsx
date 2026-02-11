// src/components/Dashboard/ImprovementInsights.tsx
import React from 'react';
import { Insight } from './types';

const insights: Insight[] = [
    {
        icon: 'trending_up',
        text: 'Your class position improved by 2 places this term.',
        color: 'text-green-500'
    },
    {
        icon: 'trending_down',
        text: 'Weakest ranking subject: Economics.',
        color: 'text-red-500'
    }
];

const ImprovementInsights: React.FC = () => {
    return (
        <div className="bg-white dark:bg-[#1C2431] rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0e121b] dark:text-white mb-4">
                Improvement Insights
            </h3>
            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <span className={`material-symbols-outlined ${insight.color} mt-0.5`}>
                            {insight.icon}
                        </span>
                        <p className="text-sm text-[#0e121b] dark:text-gray-300">
                            {insight.text.split(' ').map((word, wordIndex) =>
                                word.startsWith('2') || word === 'Economics' ? (
                                    <span key={wordIndex} className="font-bold"> {word} </span>
                                ) : ` ${word} `
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImprovementInsights;