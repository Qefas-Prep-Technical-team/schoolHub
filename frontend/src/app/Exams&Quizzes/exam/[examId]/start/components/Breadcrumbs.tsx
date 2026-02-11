// src/components/Header/Breadcrumbs.tsx
import React from 'react';

const Breadcrumbs: React.FC = () => {
    const breadcrumbs = [
        { label: 'Exams & Quizzes', href: '#' },
        { label: 'Algebra Fundamentals', href: '#' },
        { label: 'Preview', isActive: true }
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.label}>
                    {index > 0 && (
                        <span className="text-[#506795] dark:text-[#9CA3AF] text-sm font-medium leading-normal">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <a
                            href={item.href}
                            className="text-[#506795] dark:text-[#9CA3AF] text-sm font-medium leading-normal hover:underline"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className={`text-sm font-medium leading-normal ${item.isActive
                                ? 'text-[#111827] dark:text-white'
                                : 'text-[#506795] dark:text-[#9CA3AF]'
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