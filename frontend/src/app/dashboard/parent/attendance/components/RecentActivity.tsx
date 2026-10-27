import Link from 'next/link'
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import type { SubjectChip } from '@/lib/attendance/attendanceRecord';

export interface Activity {
    id: string;
    date: string;
    status: 'present' | 'late' | 'absent' | 'excused';
    description: string;
    time?: string;
    lateMinutes?: number;
    comment?: string;
    subjects?: SubjectChip[];
}

interface RecentActivityProps {
    activities: Activity[];
    title?: string;
    viewAllHref?: string;
    onActivityClick?: (activityId: string) => void;
}

const chipStatusColor = (status: string) => {
    if (status === 'present') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'late') return 'text-amber-600 dark:text-amber-400';
    if (status === 'absent') return 'text-rose-600 dark:text-rose-400';
    return 'text-sky-600 dark:text-sky-400';
};

export default function RecentActivity({
    activities,
    title = 'Recent Activity',
    viewAllHref = '/parent/attendance/monthly',
    onActivityClick,
}: RecentActivityProps) {
    const getStatusColor = (status: Activity['status']) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'late': return 'bg-yellow-500';
            case 'absent': return 'bg-red-500';
            case 'excused': return 'bg-sky-500';
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
        <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <HeaderTooltip 
                        content="Shows the 5 most recent attendance logs for this student. Click any entry to see the overall school arrival status and the subject-by-subject attendance recorded by teachers for that day."
                        side="top"
                    />
                </div>
                <Link
                    href={viewAllHref}
                    className="text-xs font-bold cursor-pointer text-orange-600 hover:text-orange-700 transition-colors"
                >
                    View All
                </Link>
            </div>

            <div className="relative pl-2 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-4 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700">
                {activities.map((activity) => (
                    <button
                        type="button"
                        key={activity.id}
                        onClick={() => onActivityClick?.(activity.id)}
                        disabled={!onActivityClick}
                        className="group relative pl-6 w-full text-left rounded-xl py-1.5 pr-2 -my-1.5 transition-colors enabled:cursor-pointer enabled:hover:bg-orange-50/60 dark:enabled:hover:bg-slate-800/60"
                    >
                        {/* Timeline Dot */}
                        <div
                            className={`absolute -left-[5px] top-2.5 h-3 w-3 rounded-full ${getStatusColor(activity.status)} ring-4 ring-white dark:ring-slate-900`}
                        />

                        {/* Content */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col gap-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {activity.date}
                                </p>

                                {activity.comment && (
                                    <p className="text-xs italic text-slate-600 dark:text-slate-300 line-clamp-2">
                                        &ldquo;{activity.comment}&rdquo;
                                    </p>
                                )}

                                {activity.subjects && activity.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {activity.subjects.slice(0, 3).map((sub) => (
                                            <span
                                                key={sub.subjectId}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                            >
                                                <span className="truncate max-w-[100px]">{sub.subjectName}</span>
                                                <span className={`uppercase text-[9px] font-black ${chipStatusColor(sub.status)}`}>
                                                    {sub.status}
                                                </span>
                                            </span>
                                        ))}
                                        {activity.subjects.length > 3 && (
                                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                +{activity.subjects.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

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
                            {onActivityClick && (
                                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
