// src/components/Dashboard/Breadcrumbs.tsx
import React from 'react';
import { BreadcrumbItem } from './types';

const Breadcrumbs: React.FC = () => {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Exams', href: '#' },
        { label: 'Upcoming', href: '#' },
        { label: 'Mathematics Mid-Term Examination', isActive: true },
    ];

    return (
        <div className="flex flex-wrap gap-2 text-sm">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                    {index > 0 && (
                        <span className="text-[#506795] dark:text-gray-400 font-medium leading-normal">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <a
                            href={item.href}
                            className="text-[#506795] dark:text-gray-400 font-medium leading-normal hover:text-[#0e121b] dark:hover:text-white"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className={`font-medium leading-normal ${item.isActive
                                ? 'text-[#0e121b] dark:text-white'
                                : 'text-[#506795] dark:text-gray-400'
                            }`}>
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;