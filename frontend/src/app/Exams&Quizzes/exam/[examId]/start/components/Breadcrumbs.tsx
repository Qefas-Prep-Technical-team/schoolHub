// src/components/Header/Breadcrumbs.tsx
import React from 'react';

interface BreadcrumbsProps {
    title?: string;
    subject?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title, subject }) => {
    const breadcrumbs = [
        { label: 'Exams & Quizzes', href: '/dashboard/student/exams&quizzes' },
        ...(title ? [{ label: title, href: '#' }] : []),
        ...(subject ? [{ label: subject, isActive: true }] : [{ label: 'Live Exam Session', isActive: true }]),
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                    {index > 0 && (
                        <span className="text-slate-400 dark:text-slate-600 text-sm font-medium leading-normal">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <a
                            href={item.href}
                            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium leading-normal hover:underline"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className={`text-sm font-medium leading-normal ${item.isActive
                                ? 'text-slate-900 dark:text-white font-semibold'
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