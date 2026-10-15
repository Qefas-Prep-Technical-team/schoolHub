'use client';

import React from 'react';
import { Link2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface TeacherLinkingHeaderProps {
  onConnectClick: () => void;
  onShowQRCodeClick: () => void;
}

export function TeacherLinkingHeader({ onConnectClick, onShowQRCodeClick }: TeacherLinkingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Linking Hub
          </h1>
          <HeaderTooltip
            content="Establish secure, bidirectional classroom and institutional connections. Share your unique Teacher Code or QR badge to onboard scholars, guardians, and class cohorts into your academic workspace."
            size={15}
          />
        </div>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium mt-1">
          Onboard students, link guardians, and manage institutional school network connections.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
        {/* View QR Hub */}
        <Button
          onClick={onShowQRCodeClick}
          variant="outline"
          className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm"
        >
          <QrCode className="mr-2 h-4 w-4 shrink-0" />
          <span>View QR Hub</span>
        </Button>

        {/* Connect with Code */}
        <button
          onClick={onConnectClick}
          className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-7 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-white transition-all bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <Link2 className="h-4 w-4 shrink-0" />
          <span>Connect with Code</span>
        </button>
      </div>
    </div>
  );
}
