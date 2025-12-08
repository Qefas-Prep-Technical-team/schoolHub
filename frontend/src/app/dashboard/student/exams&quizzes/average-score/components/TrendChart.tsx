// src/components/Dashboard/TrendChart.tsx
import React from 'react';
import { TrendPoint } from './types';

const TrendChart: React.FC = () => {
    const trendData: TrendPoint[] = [
        { label: 'Test 1', percentage: 75, height: '60%' },
        { label: 'Test 2', percentage: 85, height: '60%' },
        { label: 'Exam', percentage: 90, height: '60%' },
        { label: 'Final', percentage: 82, height: '60%' },
    ];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">
                Performance Trend
            </h2>
            <div className="rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
                <div className="flex justify-between items-start">
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        Score Progression
                    </p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Score</span>
                    </div>
                </div>
                <div className="flex h-full w-full items-end gap-3 pt-6">
                    {trendData.map((point, index) => (
                        <div key={index} className="flex h-full w-1/4 flex-col items-center justify-end gap-2">
                            <div className="h-[60%] w-full rounded-t-lg bg-primary/20 dark:bg-primary/30">
                                <div
                                    className="h-full w-full rounded-t-lg bg-primary"
                                    style={{ height: `${point.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{point.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendChart;