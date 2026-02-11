'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';

interface ParentHeaderProps {
  onMenuClick: () => void;
}

export default function ParentHeader({ onMenuClick }: ParentHeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          Attendance
        </span>
      </div>
      
      <div className="relative size-8">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY1QM3Sk4YdES_tlKPYcLA9j5WQb4t7jXByIP8mgBJ0JNZP_42lOMxwP0h68hrDwTVjhqez00atFjt33T6wJnj-RJsqd7Alf1U9AVdp1zTrbnHyxSqUEnmgcRwjE43eIxlCgBy9HCF7hx-91tnGw0_RaG_cCp3bNPEwQs6dxGsbNRs6ckzKtDROM3QihPCoExjD6wAFp0P0M7Q7B2Yq990sh0boCsJfHFNZWaovFcsbYiFig63W-ggjO6laMVWx-6UCbQho2D6ry4"
          alt="User profile"
          fill
          className="rounded-full object-cover"
        />
      </div>
    </header>
  );
}