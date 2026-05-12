// src/components/Header/PageHeader.tsx
import React from 'react';
import Breadcrumbs from './Breadcrumbs';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="flex flex-col gap-1">
            <div className="flex flex-col">
                <p className="text-3xl font-black tracking-tight text-[#111827] dark:text-white leading-tight">
                    {title}
                </p>
                {subtitle && (
                    <p className="text-xs font-black uppercase tracking-widest text-primary italic">
                        {subtitle}
                    </p>
                )}
            </div>
            <Breadcrumbs />
        </header>
    );
};

export default PageHeader;