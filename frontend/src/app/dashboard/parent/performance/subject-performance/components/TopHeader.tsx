'use client';

import { useState } from 'react';
import { Download, Bell, Menu, Search, Mail } from 'lucide-react';
import { useTheme } from 'next-themes';


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
                        className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium">
                        <span>Academics</span>
                        <span className="text-[16px]">/</span>
                        <span className="text-gray-900 dark:text-white">{title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Export Button */}
                    <button className="hidden sm:flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export Report</span>
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900" />
                    </button>
                </div>
            </header>
        </>
    );
}