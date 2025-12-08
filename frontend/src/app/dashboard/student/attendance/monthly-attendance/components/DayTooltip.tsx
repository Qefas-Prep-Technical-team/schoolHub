// src/components/Calendar/DayTooltip.tsx
import React from 'react';

interface DayTooltipProps {
    title: string;
    description: string;
}

const DayTooltip: React.FC<DayTooltipProps> = ({ title, description }) => {
    return (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-card-dark text-text-dark-primary p-4 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <h4 className="font-bold">{title}</h4>
            <p className="text-sm text-text-dark-secondary mt-1">{description}</p>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-card-dark"></div>
        </div>
    );
};

export default DayTooltip;