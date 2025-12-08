// src/components/Dashboard/TechnicalRequirements.tsx
import React from 'react';
import { TechnicalRequirement } from './types';

const TechnicalRequirements: React.FC = () => {
    const requirements: TechnicalRequirement[] = [
        { icon: 'wifi', text: 'A stable and reliable internet connection is required throughout the exam.' },
        { icon: 'battery_charging_full', text: 'Ensure your device is fully charged or connected to a power source.' },
        { icon: 'computer', text: 'Recommended browsers: Latest versions of Chrome, Firefox, or Safari.' },
    ];

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-[#0e121b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                Technical Requirements
            </h2>
            <div className="rounded-xl border border-[#d1d8e6] dark:border-gray-700 bg-white dark:bg-[#1a232f] p-6">
                <ul className="space-y-3 text-[#506795] dark:text-gray-300">
                    {requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary mt-1">
                                {requirement.icon}
                            </span>
                            <span>{requirement.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TechnicalRequirements;