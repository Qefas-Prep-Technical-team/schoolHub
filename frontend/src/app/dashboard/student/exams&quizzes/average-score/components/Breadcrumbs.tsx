// src/components/Header/Breadcrumbs.tsx
import React from 'react';
import { BreadcrumbItem } from './types';


const Breadcrumbs: React.FC = () => {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '#' },
        { label: 'Results', href: '#' },
        { label: 'Average Score', isActive: true },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                    {index > 0 && (
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <a
                            href={item.href}
                            className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className={`text-sm font-medium leading-normal ${item.isActive
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-500 dark:text-slate-400'
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