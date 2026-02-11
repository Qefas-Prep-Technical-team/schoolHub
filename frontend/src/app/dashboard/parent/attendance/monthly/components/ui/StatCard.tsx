import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    change?: {
        value: string;
        isPositive: boolean;
    };
    color?: string;
    icon?: LucideIcon;
}

export default function StatCard({
    label,
    value,
    change,
    color = 'text-slate-900 dark:text-white',
    icon: Icon
}: StatCardProps) {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                {label}
            </span>

            <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${color}`}>
                    {value}
                </span>

                {change && (
                    <span className={`
            text-xs font-medium px-1.5 py-0.5 rounded-full mb-1 flex items-center gap-1
            ${change.isPositive
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                            : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                        }
          `}>
                        {Icon && <Icon className="h-3 w-3" />}
                        {change.value}
                    </span>
                )}
            </div>
        </div>
    );
}