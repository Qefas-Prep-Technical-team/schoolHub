// src/components/Dashboard/ChartLegend.tsx
import React from 'react';
import { ChartLegendItem } from './types';
import Badge from './ui/Badge';

const ChartLegend: React.FC = () => {
    const legendItems: ChartLegendItem[] = [
        { label: 'Present', color: 'bg-green-500' },
        { label: 'Late', color: 'bg-yellow-500' },
        { label: 'Absent', color: 'bg-red-500' },
    ];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
                <h3 className="text-lg font-bold text-text-light-primary dark:text-dark-primary">
                    Monthly Breakdown
                </h3>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                    Visual summary of your attendance this month.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Badge color="green">Great Consistency</Badge>
                <div className="flex items-center gap-4 text-sm">
                    {legendItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <div className={`size-2.5 rounded-full ${item.color}`}></div>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChartLegend;