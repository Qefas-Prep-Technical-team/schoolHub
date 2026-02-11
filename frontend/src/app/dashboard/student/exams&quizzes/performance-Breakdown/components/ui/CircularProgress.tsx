interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    className?: string;
}

export default function CircularProgress({
    value,
    size = 24,
    strokeWidth = 3,
    label,
    className = ''
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value, 0), 100);
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg className="size-full" viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    className="stroke-gray-200 dark:stroke-gray-700"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    className="stroke-primary transition-all duration-500 ease-out"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>

            {/* Center label */}
            {label && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {label}
                    </span>
                </div>
            )}
        </div>
    );
}