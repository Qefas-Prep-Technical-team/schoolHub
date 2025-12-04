'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface StudentHeaderProps {
    user: {
        name: string;
        avatarUrl: string;
    };
}

const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Classes', href: '/dashboard/classes' },
    { label: 'Grades', href: '/dashboard/grades' },
    { label: 'Assignments', href: '/dashboard/assignments' },
];

export default function StudentHeader({ user }: StudentHeaderProps) {
    const [activeNav, setActiveNav] = useState('Grades');

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-black/10 dark:border-b-white/10 px-4 py-3">
            {/* Logo and Title */}
            <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="size-6 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                            clipRule="evenodd"
                            d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                            fill="currentColor"
                            fillRule="evenodd"
                        />
                    </svg>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Student Dashboard
                </h2>
            </div>

            {/* Navigation and Actions */}
            <div className="flex flex-1 justify-end gap-4 md:gap-8">
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-9">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setActiveNav(item.label)}
                            className={`text-sm font-medium leading-normal transition-colors ${activeNav === item.label
                                    ? 'text-primary font-bold'
                                    : 'text-slate-900 dark:text-white hover:text-primary'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Action Buttons and Profile */}
                <div className="flex items-center gap-2">
                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                        title="Notifications"
                    >
                        <span className="material-symbols-outlined text-xl">
                            notifications
                        </span>
                    </button>

                    <button
                        className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                        title="Settings"
                    >
                        <span className="material-symbols-outlined text-xl">
                            settings
                        </span>
                    </button>

                    <div className="relative h-10 w-10">
                        <Image
                            src={user.avatarUrl}
                            alt="Student profile picture"
                            fill
                            className="rounded-full object-cover"
                            sizes="40px"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}