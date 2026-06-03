"use client";
import * as React from 'react';
import Toolbar from '@mui/material/Toolbar';
import BigNavBar from './BigNavBar';
import { MiniNav } from './MiniNav';
import NextTopLoader from 'nextjs-toploader';
import { usePathname } from 'next/navigation';


function NavBar() {
    const pathname = usePathname()
    const [isSubdomain, setIsSubdomain] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            const host = window.location.hostname;
            let hasSub = false;
            
            const rootDomains = ["schoolhub.flexitistudio.com", "qefashub.com", "localhost", "127.0.0.1"];
            const isRoot = rootDomains.some(domain => 
                host === domain || host === `www.${domain}`
            );
            
            if (!isRoot) {
                if (host.includes("localhost") || host.includes("127.0.0.1")) {
                    const parts = host.split(".");
                    hasSub = parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www";
                } else {
                    hasSub = true;
                }
            }
            setIsSubdomain(hasSub);
        }
    }, []);

    const isDashboard = pathname.startsWith("/dashboard") || 
                        pathname.startsWith("/console") || 
                        pathname.startsWith("/platform");

    const shouldShow = !isDashboard && !isSubdomain;

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

    if (!mounted) return null;

    return (
        shouldShow && (
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <div className="max-w-[1440px] mx-auto">
                    <Toolbar className="justify-between flex min-h-[72px] px-4 md:px-8" disableGutters>
                        <BigNavBar pages={pages} />
                        <MiniNav
                            pages={pages}
                        />
                    </Toolbar>
                </div>
                <NextTopLoader showSpinner={false} color="#2563eb" height={3} />
            </header>
        )
    );
}
export default NavBar;
