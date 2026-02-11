import Link from 'next/link'
import StatusBadge from './StatusBadge';

interface Activity {
    id: string;
    date: string;
    status: 'present' | 'late' | 'absent';
    description: string;
    time?: string;
    lateMinutes?: number;
}

interface RecentActivityProps {
    activities: Activity[];
    title?: string;
    viewAllHref?: string;
}

export default function RecentActivity({
    activities,
    title = 'Recent Activity',
    viewAllHref = '/parent/attendance/monthly'
}: RecentActivityProps) {
    const getStatusColor = (status: Activity['status']) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'late': return 'bg-yellow-500';
            case 'absent': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getBadgeText = (activity: Activity) => {
        if (activity.status === 'late' && activity.lateMinutes) {
            return `${activity.lateMinutes} mins late`;
        }
        if (activity.status === 'present') {
            return activity.time || 'On Time';
        }
        return '';
    };

    const getBadgeVariant = (activity: Activity) => {
        if (activity.status === 'present') return 'success';
        if (activity.status === 'late') return 'warning';
        return 'default';
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <Link
                    href={viewAllHref}
                    className="text-xs font-bold cursor-pointer text-primary hover:underline"
                >
                    View All
                </Link>
            </div>

            <div className="relative pl-2 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-4 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700">
                {activities.map((activity) => (
                    <div key={activity.id} className="relative pl-6">
                        {/* Timeline Dot */}
                        <div
                            className={`absolute -left-[5px] top-1 h-3 w-3 rounded-full ${getStatusColor(activity.status)} ring-4 ring-white dark:ring-surface-dark`}
                        />

                        {/* Content */}
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                                {activity.date}
                            </p>

                            {getBadgeText(activity) && (
                                <div className="mt-1">
                                    <StatusBadge
                                        variant={getBadgeVariant(activity)}
                                        text={getBadgeText(activity)}
                                        size="xs"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}