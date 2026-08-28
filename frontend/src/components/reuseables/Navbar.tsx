'use client';

import Link from 'next/link';
import Image from 'next/image';
import colors from '@/styles/colors';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react'


export default function Navbar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/user-panel', label: 'User Panegl' },
    ];

    return (
        <nav
            className="sticky top-0 z-50 w-full shadow-sm px-6 py-4 flex items-center justify-between bg-white/70 dark:bg-[#111827]/70 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors duration-300"
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo/favicon.svg" alt="Qefas Hub Logo" width={32} height={32} />
                <span className="font-bold text-lg tracking-tight">Qefas Hub</span>
            </Link>

            {/* Links */}
            <div className="flex items-center space-x-6">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`hover:underline ${pathname === link.href ? 'font-semibold underline' : ''
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}

                {/* Dark Mode Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                )}

            </div>
        </nav>
    );
}
