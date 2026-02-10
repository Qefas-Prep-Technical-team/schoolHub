import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    progress?: number;
    progressColor?: string;
    showProgress: boolean;
    warning?: boolean;
    link?: {
        label: string;
        href: string;
    };
}

export default function KPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg,
    trend,
    progress = 0,
    progressColor = 'bg-green-500',
    showProgress,
    warning = false,
    link,
}: KPICardProps) {
    return (
        <div className={cn(
            'flex flex-col gap-3 rounded-xl p-5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm',
            warning && 'border-l-4 border-l-orange-500 relative overflow-hidden'
        )}>
            {/* Warning Decoration */}
            {warning && (
                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                    <Icon className="text-[80px]" />
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium">
                    {title}
                </p>
                <span className={`flex items-center justify-center size-8 rounded-full ${iconBg} ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>

            {/* Value & Trend */}
            <div className="flex items-baseline gap-2 z-10">
                <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {value}
                </h3>
                {subtitle && (
                    <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-normal">
                        {subtitle}
                    </span>
                )}
                {trend && (
                    <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded flex items-center',
                        trend.isPositive
                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    )}>
                        {trend.isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                        ) : (
                            <TrendingDown className="h-3 w-3 mr-0.5" />
                        )}
                        {trend.value}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            {showProgress && (
                <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-1.5 mt-auto z-10">
                    <div
                        className={cn('h-1.5 rounded-full transition-all duration-500', progressColor)}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Link */}
            {link && (
                <Link
                    href={link.href}
                    className="text-xs font-bold text-primary hover:underline mt-auto flex items-center"
                >
                    {link.label}
                    <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            )}
        </div>
    );
}