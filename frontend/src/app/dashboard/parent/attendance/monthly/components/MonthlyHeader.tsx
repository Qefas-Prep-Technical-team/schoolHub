'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';

interface MonthlyHeaderProps {
  onMenuClick: () => void;
}

export default function MonthlyHeader({ onMenuClick }: MonthlyHeaderProps) {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="size-11 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <Menu className="h-6 w-6" strokeWidth={2.2} />
        </button>
        <span className="font-bold text-lg text-slate-900 dark:text-white">
          EduConnect
        </span>
      </div>
      
      <div className="relative h-8 w-8">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDc_EYG9MDW6ayna326-oIm4ZcmyzvBlRKsBhhKXVHE7JlWmadWrFX3Ftqx8DtBtroZzmgwBrPATrefTJ0_haBO87On_hP6xwSnFNjZbVB3_1z_VsI6DbLFz0klxV7c_keoGr5jOForeMr1_xGuPWTCD1wLXhXQ3By4VpD5aTtOjVFI2p37jKODVvw6vSSEIVC1ocPc9FckefaK_ZqhKDhtp8lT-zHU9pLcTGnfxRG1fY8nnsoXAyMelSKYOvqUWuLIjX9WnUMXnc"
          alt="User avatar"
          fill
          className="rounded-full object-cover"
        />
      </div>
    </div>
  );
}
