import Box from "@mui/material/Box" // Re-triggering recompile
import React, { FC } from "react";
import Image from "next/image";
import Link from "next/link";
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
        <Box className="flex items-center justify-between w-full px-2" sx={{ display: { xs: 'flex', md: 'none' } }}>
            <div className="flex items-center gap-3">
                <NavBarDrawer pages={pages} />
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-md shadow-blue-600/10 border border-slate-200 dark:border-slate-800 p-1">
                        <img src="/logo/favicon.svg" alt="Qefas Hub" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                        Qefas <span className="text-blue-600">Hub</span>
                    </span>
                </Link>
            </div>
            <ThemeToggle />
        </Box>
    )
}
