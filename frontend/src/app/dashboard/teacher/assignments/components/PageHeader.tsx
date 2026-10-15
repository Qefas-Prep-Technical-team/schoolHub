'use client';

import { ReactNode } from 'react';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    tooltip?: string;
}

export default function PageHeader({ title, description, action, tooltip }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 w-full">
            <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    {tooltip && <HeaderTooltip content={tooltip} />}
                </div>
                {description && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex items-center w-full sm:w-auto">
                    {action}
                </div>
            )}
        </div>
    );
}
