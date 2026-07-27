'use client';
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function LogoTitle() {
  return (
    <div className="mb-4 flex flex-col items-center justify-center text-center space-y-2">
      <Link href="/" className="group flex items-center gap-3 transition transform hover:scale-105">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/25 border border-white/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">QefasHub</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Account Security</p>
        </div>
      </Link>
    </div>
  );
}
