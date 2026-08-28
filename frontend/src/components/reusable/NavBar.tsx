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

    const isSetupFlow = pathname.startsWith("/select-plan") || 
                        pathname.startsWith("/checkout") || 
                        pathname.startsWith("/onboarding");

    const shouldShow = !isDashboard && !isSetupFlow && !isSubdomain;

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
            <div className="fixed top-4 left-0 w-full z-50 px-4 md:px-8 flex justify-center pointer-events-none">
                <header className="pointer-events-auto w-full max-w-[1440px] bg-white/40 dark:bg-[#0a0f1e]/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl transition-all duration-300 supports-[backdrop-filter]:bg-white/20">
                    <Toolbar className="justify-between flex min-h-[64px] px-4 md:px-6" disableGutters>
                        <BigNavBar pages={pages} />
                        <MiniNav pages={pages} />
                    </Toolbar>
                    <NextTopLoader showSpinner={false} color="#2563eb" height={3} />
                </header>
            </div>
        )
    );
}
export default NavBar;
