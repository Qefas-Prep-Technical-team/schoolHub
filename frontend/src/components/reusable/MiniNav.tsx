import Box from "@mui/material/Box"
import React, { FC } from "react";
import Image from "next/image";
import Typography from "@mui/material/Typography";

import { ThemeToggle } from "@/app/theme-toggle";
import NavBarDrawer from "./NavBarDrawer";
import { mainTab } from "../Types/Nav";

interface MiniNavProps {
    handleOpenNavMenu: (event: React.MouseEvent<HTMLElement>) => void;
    pages: mainTab[];
    handleCloseNavMenu: () => void;
}

export const MiniNav: FC<MiniNavProps> = ({ pages }) => {
    return (
        <Box className="flex items-center justify-between p-2 w-100" sx={{ display: { xs: 'flex', md: 'none' } }}>
            <NavBarDrawer pages={pages} />
            <Box className='flex items-center flex-row justify-center'>
                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, mr: 2 }}>
                    <Image src="/schoolhub.png" alt="school hub logo" width={20} height={20} className='space-x-20' />
                </Box>
                <Typography
                    variant="h5"
                    noWrap
                    component="a"
                    href="\"
                    sx={{
                        mr: 2,
                        display: { xs: 'flex', md: 'none' },
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    SCHOOLHUB
                </Typography>
            </Box>
            <ThemeToggle />
        </Box>
    )
}