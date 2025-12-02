'use client';

interface ProgressBarProps {
    value: number;
    max: number;
    showLabels?: boolean;
    label?: string;
    className?: string;
}

export default function ProgressBar({
    value,
    max,
    showLabels = true,
    label,
    className = ''
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`w-full ${className}`}>
            {showLabels && (
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {label || `${value} / ${max} Graded`}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            )}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}