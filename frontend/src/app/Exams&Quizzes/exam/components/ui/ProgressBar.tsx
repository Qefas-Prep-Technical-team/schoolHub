// src/components/UI/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    progress: number; // 0-100
    showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = false }) => {
    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-primary dark:text-primary">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-primary dark:text-primary">
                        {progress}%
                    </span>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;