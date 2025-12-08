import { BreadcrumbItem } from './types';

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex flex-wrap gap-2 text-sm">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                        <span className="font-medium leading-normal text-gray-500 dark:text-[#95a5c6]">
                            /
                        </span>
                    )}
                    {item.href ? (
                        <a
                            href={item.href}
                            className="font-medium leading-normal text-gray-500 hover:text-primary dark:text-[#95a5c6]"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className="font-medium leading-normal text-gray-900 dark:text-white">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}