import { cn } from '@/lib/utils';

interface AttendanceBadgeProps {
    type: 'present' | 'absent' | 'late' | 'excused' | 'unexcused';
    size?: 'sm' | 'md' | 'lg';
}

export default function AttendanceBadge({ type, size = 'md' }: AttendanceBadgeProps) {
    const config = {
        present: {
            label: 'Present',
            colors: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        absent: {
            label: 'Absent',
            colors: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        },
        late: {
            label: 'Late',
            colors: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        excused: {
            label: 'Excused',
            colors: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        },
        unexcused: {
            label: 'Unexcused',
            colors: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        },
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span className={cn(
            'inline-flex items-center justify-center rounded-lg font-medium',
            config[type].colors,
            sizeClasses[size]
        )}>
            {config[type].label}
        </span>
    );
}