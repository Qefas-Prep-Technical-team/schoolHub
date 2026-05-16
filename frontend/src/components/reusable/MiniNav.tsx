import Box from "@mui/material/Box" // Re-triggering recompile
import React, { FC } from "react";
import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/app/theme-toggle";
import NavBarDrawer from "./NavBarDrawer";
import { mainTab } from "../Types/Nav";

interface MiniNavProps {
    pages: mainTab[];
}

export const MiniNav: FC<MiniNavProps> = ({ pages }) => {
    return (
        <Box className="flex items-center justify-between w-full px-4 py-2" sx={{ display: { xs: 'flex', md: 'none' } }}>
            {/* Left: Drawer Toggle */}
            <div className="flex-1 flex justify-start">
                <NavBarDrawer pages={pages} />
            </div>

            {/* Center: Logo and Branding */}
            <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-lg shadow-blue-600/10 border border-slate-200 dark:border-slate-800 p-1.5 relative">
                    <Image src="/logo/favicon.svg" alt="Qefas Hub" fill className="object-contain p-1.5" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-lexend">
                    Qefas <span className="text-blue-600">Hub</span>
                </span>
            </Link>

            {/* Right: Theme Toggle */}
            <div className="flex-1 flex justify-end">
                <ThemeToggle />
            </div>
        </Box>
    )
}
