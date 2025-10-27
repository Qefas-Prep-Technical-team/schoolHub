'use client';

import Link from 'next/link';
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
        { href: '/user-panel', label: 'User Panel' },
    ];

    return (
        <nav
            className="w-full shadow-md px-6 py-4 flex items-center justify-between"
            style={{
                backgroundColor:
                    theme === 'dark' ? colors.backgroundDark : colors.primary,
                color: theme === 'dark' ? 'white' : 'white',
            }}
        >
            {/* Logo */}
            <div className="font-bold text-lg">Flex Savy Studio</div>

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
