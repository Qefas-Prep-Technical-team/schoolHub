"use client";
import React from "react";
import Link from "next/link";

const PortalsFooter: React.FC = () => {
    return (
        <footer className="bg-[#f8f9ff] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-all duration-200 font-['Lexend'] mt-10">
            <div className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">Qefas Hub</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        © 2026 Qefas Hub Academic Systems. All rights reserved.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <Link className="hover:text-[#0051d5] dark:hover:text-blue-400 transition-colors" href="/privacy">Privacy Policy</Link>
                    <Link className="hover:text-[#0051d5] dark:hover:text-blue-400 transition-colors" href="/terms">Terms of Service</Link>
                    <Link className="hover:text-[#0051d5] dark:hover:text-blue-400 transition-colors" href="/contact">Contact Us</Link>
                </div>
            </div>
        </footer>
    );
};

export default PortalsFooter;
