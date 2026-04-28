"use client";
import React from "react";
import Link from "next/link";

const PortalsNavbar: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 font-['Lexend'] transition-all">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          <img src="/logo/favicon.svg" alt="Qefas Hub Logo" className="h-10 w-10" />
          <span>Qefas Hub</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/login" className="text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white pb-1 transition-colors">
            Directory
          </Link>
          <Link href="/about" className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            About
          </Link>
          <Link href="/support" className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Support
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="bg-[#0051d5] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default PortalsNavbar;
