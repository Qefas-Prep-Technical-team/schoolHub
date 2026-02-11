'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex flex-col">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0e121b] dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="text-[#506795] dark:text-[#9CA3AF] text-base font-normal leading-normal mt-1">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="hidden md:block">
                    {action}
                </div>
            )}
        </div>
    );
}