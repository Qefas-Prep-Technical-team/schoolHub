interface ProgressBarProps {
    value: number;
    maxValue?: number;
    color?: string;
    showLabel?: boolean;
    labelPosition?: 'inside' | 'outside';
    height?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
    value,
    maxValue = 100,
    color = 'bg-primary',
    showLabel = true,
    labelPosition = 'outside',
    height = 'md',
}: ProgressBarProps) {
    const percentage = Math.min((value / maxValue) * 100, 100);

    const heightClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    return (
        <div className="space-y-1">
            {showLabel && labelPosition === 'outside' && (
                <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{value}/{maxValue} ({percentage.toFixed(0)}%)</span>
                </div>
            )}

            <div className={`w-full ${heightClasses[height]} bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden`}>
                <div
                    className={`${heightClasses[height]} ${color} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                >
                    {showLabel && labelPosition === 'inside' && (
                        <span className="absolute right-2 text-xs font-bold text-white mix-blend-difference">
                            {percentage.toFixed(0)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}