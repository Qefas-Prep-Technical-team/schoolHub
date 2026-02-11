'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
    Search,
    Bell,
    Sun,
    Moon
} from 'lucide-react';
import Image from 'next/image';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const { theme, setTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 md:px-10 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-text-main dark:text-white font-display">
                        EduParent
                    </h1>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {/* Search Bar */}
                    <div className="hidden md:flex relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-text-secondary dark:text-text-secondary-dark" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-xl border-none bg-background-light dark:bg-background-dark py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white placeholder-text-secondary"
                            placeholder="Search records..."
                        />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 text-text-secondary hover:text-primary dark:text-text-secondary-dark dark:hover:text-white transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-text-secondary hover:text-primary dark:text-text-secondary-dark dark:hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 size-2 bg-danger rounded-full border-2 border-surface-light dark:border-surface-dark" />
                    </button>

                    {/* Profile */}
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="relative size-9">
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3rV0E7T4-jtM4lBPyCeXnm63SCldY2yCxPsMpgadNEzzss7WxrwOCiFpeJ7WHTidZk3EESF292WJXX9Iqn7HpnKnQwGqb-3fuCU3JE2yWO1lLg-JeMYFYLVmrEiePRDRX5Zj__thbwfKLIN5IG00Qj-cZB8W2S8SyU2oDpLgnsiuYRBZ_VCA6teK1eLLuj79LbIcera3PUjuWS_NKc9OeSLmUSlXRRjDFbc4k0kEY7DAIWjAef8enVFFjRepY39m-aJXnJn4svaI"
                                alt="Profile picture of parent user"
                                fill
                                className="rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}