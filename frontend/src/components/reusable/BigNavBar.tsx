import { ThemeToggle } from '@/app/theme-toggle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import React, { FC, useEffect, useState } from 'react';
import { Button as Button2 } from "@/components/ui/button";
import { mainTab } from '../Types/Nav';
import Link from 'next/link';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useAuthModalStore } from '@/utils/AuthModalStore';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogIn, Rocket } from 'lucide-react';
interface BigNavBarProps {
    pages: mainTab[];
    handleCloseNavMenu: () => void
}
const BigNavBar: FC<BigNavBarProps> = ({ pages, handleCloseNavMenu }) => {
    const { isAuthenticated } = useAuthStore();
    const { openModal } = useAuthModalStore();




    return (
        <Box
            className="w-full px-6 hidden md:flex items-center justify-between py-1"
        >
            {/* Left: Logo */}
            <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform">
                    <Image src="/schoolhub.png" alt="Qefas Hub Logo" width={24} height={24} className="brightness-0 invert" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                    Qefas <span className="text-blue-600">Hub</span>
                </span>
            </Link>

            {/* Center: Nav Links */}
            <div className="flex items-center gap-8">
                {pages.map((page) => (
                    <Link
                        key={page.name}
                        href={page.href}
                        className="relative text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 group"
                    >
                        {page.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                    </Link>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                {!isAuthenticated ? (
                    <div className="flex items-center gap-3">
                        <Link href="/login" passHref>
                            <Button2 
                                variant="ghost"
                                className="font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Log in
                            </Button2>
                        </Link>
                        <Link href="/signup" passHref>
                            <Button2 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-blue-600/20"
                            >
                                <Rocket className="w-4 h-4" />
                                Get Started
                            </Button2>
                        </Link>
                    </div>
                ) : (
                    <Link href="/dashboard">
                        <Button2 className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl px-6 gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Button2>
                    </Link>
                )}
            </div>
        </Box>
    );
};

export default BigNavBar;
