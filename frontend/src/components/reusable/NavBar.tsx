"use client";
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { ThemeToggle } from '@/app/theme-toggle';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import BigNavBar from './BigNavBar';
import { MiniNav } from './MiniNav';
import NextTopLoader from 'nextjs-toploader';
import { usePathname } from 'next/navigation';

const pages = ['Feature', 'Pricing', 'About Us'];
const settings = ['Feature', 'Pricing', 'About Us', 'contact'];

function NavBar() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const pathname = usePathname()
    const isDashboard = pathname.startsWith("/dashboard") || 
                        pathname.startsWith("/console") || 
                        pathname.startsWith("/platform");
    const pages = [
        {
            name: 'Features',
            href: '/features'
        },
        {
            name: 'Pricing',
            href: '/pricing'
        },
        {
            name: 'About Us',
            href: '/about'
        },
        {
            name: 'Contact Us',
            href: '/contact'
        }
    ]

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const { theme } = useTheme();
    return (
        !isDashboard && (
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <div className="max-w-[1440px] mx-auto">
                    <Toolbar className="justify-between flex min-h-[72px] px-4 md:px-8" disableGutters>
                        <BigNavBar pages={pages} handleCloseNavMenu={handleCloseNavMenu} />
                        <MiniNav
                            handleOpenNavMenu={handleOpenNavMenu}
                            pages={pages}
                            handleCloseNavMenu={handleCloseNavMenu}
                        />
                    </Toolbar>
                </div>
                <NextTopLoader showSpinner={false} color="#2563eb" height={3} />
            </header>
        )
    );
}
export default NavBar;
