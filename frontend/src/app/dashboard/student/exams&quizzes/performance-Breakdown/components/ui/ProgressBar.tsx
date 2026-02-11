interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showLabel?: boolean;
    color?: 'green' | 'yellow' | 'red' | 'primary' | 'gray';
    className?: string;
}

export default function ProgressBar({
    value,
    max = 100,
    label,
    showLabel = true,
    color = 'primary',
    className = ''
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    const colorClasses = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        primary: 'bg-primary',
        gray: 'bg-gray-400',
    };

    const textColor = {
        green: 'text-green-500',
        yellow: 'text-yellow-500',
        red: 'text-red-500',
        primary: 'text-primary',
        gray: 'text-gray-400',
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {showLabel && label && (
                <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                    <span className={`text-sm font-medium ${textColor[color]}`}>
                        {value}%
                    </span>
                </div>
            )}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${colorClasses[color]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}