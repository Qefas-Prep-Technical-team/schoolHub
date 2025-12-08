interface StatusBadgeProps {
    status: 'correct' | 'wrong' | 'partially-correct';
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const statusConfig = {
        correct: {
            label: 'Correct',
            icon: 'check_circle',
            bgColor: 'bg-green-100 dark:bg-green-900/50',
            textColor: 'text-green-700 dark:text-green-300',
        },
        wrong: {
            label: 'Wrong',
            icon: 'cancel',
            bgColor: 'bg-red-100 dark:bg-red-900/50',
            textColor: 'text-red-700 dark:text-red-300',
        },
        'partially-correct': {
            label: 'Partially Correct',
            icon: 'warning',
            bgColor: 'bg-amber-100 dark:bg-amber-900/50',
            textColor: 'text-amber-700 dark:text-amber-300',
        },
    };

    const config = statusConfig[status];

    return (
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${config.bgColor} ${config.textColor} ${className}`}>
            <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
            >
                {config.icon}
            </span>
            <span>{config.label}</span>
        </div>
    );
}