'use client';

import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-gray-100 text-sm font-medium leading-normal">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}