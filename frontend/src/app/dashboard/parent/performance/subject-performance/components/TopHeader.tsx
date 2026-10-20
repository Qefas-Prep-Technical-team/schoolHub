'use client';

import { useState } from 'react';
import { Bell, Menu, Search, Mail } from 'lucide-react';
import { useTheme } from 'next-themes';
import NotificationCenter from '@/components/notifications/NotificationCenter';


interface TopHeaderProps {
    title: string;
    studentName: string;
    grade: string;
}

export default function TopHeader({ title, studentName, grade }: TopHeaderProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme } = useTheme();

    return (
        <>

            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-4">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open navigation menu"
                        className="lg:hidden size-11 flex items-center justify-center -ml-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
                    >
                        <Menu className="h-6 w-6" strokeWidth={2.2} />
                    </button>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium">
                        <span>Academics</span>
                        <span className="text-[16px]">/</span>
                        <span className="text-gray-900 dark:text-white">{title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <NotificationCenter />
                </div>
            </header>
        </>
    );
}
