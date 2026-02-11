// src/components/UI/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    percentage: number;
    color: string;
    darkColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, color, darkColor }) => {
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full ${color} ${darkColor || ''}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;