import { LucideIcon, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProgressBar from './ui/ProgressBar';

interface SubjectCardProps {
    subject: {
        name: string;
        teacher: string;
        score: number;
        grade: string;
        gradeColor: string;
        icon: LucideIcon;
        iconColor: string;
        iconBg: string;
        progressColor: string;
        classAverage: number;
        comment: string;
        needsAttention?: boolean;
    };
    onClick?: () => void;
}

export default function SubjectCard({ subject, onClick }: SubjectCardProps) {
    const Icon = subject.icon;

    return (
        <div
            onClick={onClick}
            className="flex flex-col rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/20"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        'size-12 rounded-xl flex items-center justify-center',
                        subject.iconBg
                    )}>
                        <Icon className={cn('h-7 w-7', subject.iconColor)} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {subject.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {subject.teacher}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {subject.score}%
                    </span>
                    <span className={cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset',
                        subject.gradeColor
                    )}>
                        {subject.grade}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-500 dark:text-gray-400">
                    <span>Class Avg: {subject.classAverage}%</span>
                    <span>{subject.score}/100</span>
                </div>
                <ProgressBar
                    value={subject.score}
                    maxValue={100}
                    color={subject.progressColor}
                    showLabel={false}
                />
            </div>

            {/* Comment */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {subject.comment}
                    </p>
                </div>
            </div>

            {/* Needs Attention Badge */}
            {subject.needsAttention && (
                <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-400">
                        Needs Attention
                    </span>
                </div>
            )}
        </div>
    );
}