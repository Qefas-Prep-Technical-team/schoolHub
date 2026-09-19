import React from 'react';
import { Globe, QrCode, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface StudentLinkingHeaderProps {
  onShowQRCodeClick: () => void;
  onConnectClick: () => void;
}

export function StudentLinkingHeader({ onShowQRCodeClick, onConnectClick }: StudentLinkingHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-pink-600 rounded-lg shadow-pink-200 shadow-lg">
            <Globe size={16} className="text-white" />
          </div>
          <span className="text-[10px] font-black text-pink-600 tracking-widest uppercase">Your Network</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
          Student <span className="text-pink-600">Connect</span> Hub
        </h1>
        <p className="text-sm text-slate-500 font-medium max-w-md">Your digital gateway to classes, teachers, and your verified academic circle.</p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button
          onClick={onShowQRCodeClick}
          variant="outline"
          className="flex-1 md:flex-none h-11 px-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm text-slate-900 dark:text-white"
        >
          <QrCode className="mr-2 h-4 w-4 text-pink-600" /> View QR Codes
        </Button>
        <Button
          onClick={onConnectClick}
          className="flex-1 md:flex-none h-11 px-5 rounded-xl bg-slate-900 dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-xl font-bold text-sm"
        >
          <Link2 className="mr-2 h-4 w-4" /> New Connection
        </Button>
      </div>
    </header>
  );
}
