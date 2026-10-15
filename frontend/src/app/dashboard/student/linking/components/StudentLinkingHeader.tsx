'use client';

import React from 'react';
import { Globe, QrCode, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface StudentLinkingHeaderProps {
  onShowQRCodeClick: () => void;
  onConnectClick: () => void;
}

export function StudentLinkingHeader({ onShowQRCodeClick, onConnectClick }: StudentLinkingHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
          <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Student Connect Hub
            </h1>
            <HeaderTooltip 
              content="Manage your digital school identity, link your account with parents and classrooms via unique secure codes, and explore verified academic connections."
            />
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Your digital passport to verified classes, teachers, parents, and academic peers.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch sm:self-auto">
        <Button
          onClick={onShowQRCodeClick}
          variant="outline"
          className="flex-1 sm:flex-none h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-sm"
        >
          <QrCode className="mr-2 h-4 w-4 text-pink-600 dark:text-pink-400" /> 
          QR Passports
        </Button>
        <Button
          onClick={onConnectClick}
          className="flex-1 sm:flex-none h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-pink-500/20"
        >
          <Link2 className="mr-2 h-4 w-4" /> 
          New Connection
        </Button>
      </div>
    </header>
  );
}
