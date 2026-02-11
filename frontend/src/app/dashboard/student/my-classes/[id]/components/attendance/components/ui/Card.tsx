'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export default function Card({
    children,
    title,
    subtitle,
    className = '',
    padding = 'md',
    hover = false
}: CardProps) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`
      rounded-xl border border-slate-200 dark:border-white/10 
      bg-white dark:bg-background-dark
      ${paddingClasses[padding]}
      ${hover ? 'hover:border-primary/50 dark:hover:border-primary/50 transition-colors' : ''}
      ${className}
    `}>
            {title && (
                <div className="mb-4">
                    <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}