import { BreadcrumbItem } from './types';

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                        <span className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <a
                            href={item.href}
                            className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400 hover:text-primary"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className="text-sm font-medium leading-normal text-gray-900 dark:text-white">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}