// src/components/Calendar/Legend.tsx
import React from 'react';
import { LegendItem } from './types';

const Legend: React.FC = () => {
    const legendItems: LegendItem[] = [
        {
            label: 'Present',
            color: 'bg-green-500',
            description: 'Present'
        },
        {
            label: 'Absent',
            color: 'bg-red-500',
            description: 'Absent'
        },
        {
            label: 'Late',
            color: 'bg-yellow-500',
            description: 'Late'
        },
        {
            label: 'No Class',
            color: 'bg-gray-400',
            description: 'No Class'
        }
    ];

    return (
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
            <h3 className="text-lg font-bold mb-4">Legend</h3>
            <div className="flex flex-col">
                {legendItems.map((item, index) => (
                    <div
                        key={item.label}
                        className={`flex items-center justify-between py-4 ${index > 0 ? 'border-t border-border-light dark:border-border-dark' : ''
                            }`}
                    >
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                            {item.description}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className={`size-4 rounded-full ${item.color}`}></div>
                            <p className="text-sm font-medium">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Legend;