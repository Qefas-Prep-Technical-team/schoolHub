import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
}

export default function Breadcrumbs({
    items = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Performance Overview', href: '#' },
    ]
}: BreadcrumbsProps) {
    return (
        <nav className="flex mb-6 text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-text-main dark:text-white">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}