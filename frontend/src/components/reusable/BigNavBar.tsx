import { ThemeToggle } from '@/app/theme-toggle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import React, { FC } from 'react';
import { Button as Button2 } from "@/components/ui/button";
import { mainTab } from '../Types/Nav';
import Link from 'next/link';
interface BigNavBarProps {
    pages: mainTab[];
    handleCloseNavMenu: () => void
}
const BigNavBar: FC<BigNavBarProps> = ({ pages, handleCloseNavMenu }) => {


    return (
        <Box
            className="w-full px-2 hidden md:grid grid-cols-3 items-center"
            sx={{ flexGrow: 1 }}
        >
            {/* Left: Logo */}
            <Box className="flex items-center flex-row justify-start">
                <Box className="justify-center items-center flex mr-5 p-0">
                    <Image src="/schoolhub.png" alt="school hub logo" width={30} height={30} className='space-x-20' />
                </Box>
                <Link href="/" passHref>
                    <Typography
                        variant="h6"
                        noWrap
                        component="h2"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SCHOOLHUB
                    </Typography>
                </Link>
            </Box>
            {/* Center: Nav Links */}
            <Box className="flex justify-center">
                {pages.map((page) => (
                    <Button
                        key={page.name}
                        onClick={handleCloseNavMenu}
                        sx={{ my: 2, display: 'block', color: "inherit" }}
                        component={Link}
                        href={page.href}
                    >
                        {page.name}
                    </Button>
                ))}
            </Box>
            {/* Right: Actions */}
            <Box className="flex items-center justify-end space-x-4">
                <ThemeToggle />
                <Link href="/login" passHref>
                    <Button2 className='bg-grey-500 text-black dark:text-white hover:text-white cursor-pointer'>Log in</Button2>
                </Link>
                <Link href="/signup" passHref>
                    <Button2 className='cursor-pointer'>Get Started</Button2>
                </Link>
            </Box>
        </Box>
    );
};

export default BigNavBar;