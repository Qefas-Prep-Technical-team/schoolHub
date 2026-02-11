import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: LucideIcon;
    change?: string;
    changePositive?: boolean;
    subtitleColor?: string;
    iconColor?: string;
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    change,
    changePositive,
    subtitleColor = 'text-gray-500 dark:text-gray-400',
    iconColor = 'text-primary',
}: StatCardProps) {
    return (
        <div className="flex flex-col gap-1 rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            {/* Decorative Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Icon className="h-12 w-12" />
            </div>

            {/* Content */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {title}
            </p>

            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {value}
                </p>

                {change && (
                    <span className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        changePositive
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                            : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                        {change}
                    </span>
                )}
            </div>

            <p className={cn('text-sm mt-1 font-medium', subtitleColor)}>
                {subtitle}
            </p>
        </div>
    );
}