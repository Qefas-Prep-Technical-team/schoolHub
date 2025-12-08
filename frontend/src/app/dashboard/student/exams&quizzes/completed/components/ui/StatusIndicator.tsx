interface StatusIndicatorProps {
    status: 'excellent' | 'passed' | 'needs-improvement' | 'at-risk';
    className?: string;
}

export default function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
    const statusConfig = {
        excellent: {
            label: 'Excellent',
            color: 'bg-green-500',
            bgColor: 'bg-green-100 dark:bg-green-500/10',
            textColor: 'text-green-700 dark:text-green-400',
        },
        passed: {
            label: 'Passed',
            color: 'bg-primary',
            bgColor: 'bg-primary/10 dark:bg-primary/20',
            textColor: 'text-primary',
        },
        'needs-improvement': {
            label: 'Needs Improvement',
            color: 'bg-orange-500',
            bgColor: 'bg-orange-100 dark:bg-orange-500/10',
            textColor: 'text-orange-700 dark:text-orange-400',
        },
        'at-risk': {
            label: 'At Risk',
            color: 'bg-red-500',
            bgColor: 'bg-red-100 dark:bg-red-500/10',
            textColor: 'text-red-700 dark:text-red-400',
        },
    };

    const config = statusConfig[status];

    return (
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${config.bgColor} ${className}`}>
            <div className={`size-1.5 rounded-full ${config.color}`} />
            <p className={`text-xs font-medium ${config.textColor}`}>{config.label}</p>
        </div>
    );
}