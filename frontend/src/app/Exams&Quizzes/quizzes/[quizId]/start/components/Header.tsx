'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "./ui/Button"

interface HeaderProps {
    title: string;
    breadcrumbs: Array<{
        label: string;
        href?: string;
    }>;
    onClose?: () => void;
}

export default function Header({ title, breadcrumbs, onClose }: HeaderProps) {
    const router = useRouter();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    return (
        <header className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="min-w-[84px]"
                >
                    Close Preview
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {crumb.href ? (
                            <Link
                                href={crumb.href}
                                className="text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {crumb.label}
                            </span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                /
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </header>
    );
}