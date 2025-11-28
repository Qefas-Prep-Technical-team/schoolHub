import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-primary dark:hover:text-blue-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                {item.label}
                            </span>
                        )}
                        {index < items.length - 1 && (
                            <ChevronRight size={16} />
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}