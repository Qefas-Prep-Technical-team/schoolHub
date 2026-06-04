"use client";
import Box from '@mui/material/Box';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import React, { FC } from 'react';
import Link from 'next/link';

const Footer: FC = () => {
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

    if (!mounted) return null;

    return (
        shouldShow && <Box
            className='bg-slate-900 text-white py-16'
            component="footer"
            sx={{
                left: 0,
                bottom: 0,
                width: '100%',
                color: 'white',
                textAlign: 'center',
                zIndex: 100,
            }}
        >

            <div className="container mx-auto px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-blue-500/20">
                                <NextImage src="/logo/favicon.svg" alt="Qefas Hub" width={40} height={40} className="h-full w-full object-contain" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Qefas <span className="text-blue-500">Hub</span></h3>
                        </div>
                        <p className="text-slate-400">The modern solution for academic excellence and school management.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link className="text-slate-400 hover:text-white transition-colors" href="/about">About Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><Link className="text-slate-400 hover:text-white transition-colors" href="/features">Features</Link></li>
                            <li><Link className="text-slate-400 hover:text-white transition-colors" href="/pricing">Pricing</Link></li>
                            <li><Link className="text-slate-400 hover:text-white transition-colors" href="/contact">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link className="text-slate-400 hover:text-white transition-colors" href="/terms">Terms of Service</Link></li>
                            <li><Link className="text-slate-400 hover:text-white transition-colors" href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-400 text-sm">© 2026 Qefas Hub. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="https://x.com/Qefasedu" target="_blank" rel="noopener noreferrer"><svg className="text-slate-400 hover:text-white transition-colors" fill="currentColor" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></a>
                        <a href="https://web.facebook.com/qefasprep/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer"><svg className="text-slate-400 hover:text-white transition-colors " fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path></svg></a>
                        <a href="https://www.instagram.com/qefasedu/" target="_blank" rel="noopener noreferrer"><svg className="text-slate-400 hover:text-white transition-colors" fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg></a>
                    </div>
                </div>
            </div>

        </Box>
    );
};

export default Footer;
