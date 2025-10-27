"use client";
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { ThemeToggle } from '@/app/theme-toggle';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import BigNavBar from './BigNavBar';
import { MiniNav } from './MiniNav';
import NextTopLoader from 'nextjs-toploader';

const pages = ['Feature', 'Pricing', 'About Us'];
const settings = ['Feature', 'Pricing', 'About Us', 'contact'];

function NavBar() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
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
        // {
        //     name: 'Contact',
        //     href: '/contact'
        // }
    ]

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const { theme } = useTheme();
    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: theme === "dark" ? 'black' : "white", color: theme === "dark" ? 'white' : "black", padding: 0 }}>
                <Toolbar className='justify-between flex p-0' disableGutters >
                    <BigNavBar pages={pages} handleCloseNavMenu={handleCloseNavMenu} />
                    <MiniNav
                        handleOpenNavMenu={handleOpenNavMenu}
                        pages={pages}
                        handleCloseNavMenu={handleCloseNavMenu}
                    />
                </Toolbar>
            </AppBar>
            <NextTopLoader showSpinner={false} />
        </>
    );
}
export default NavBar;
