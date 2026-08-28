import { Link2, QrCode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface LinkingHeaderProps {
  onConnectClick: () => void;
  onShowQRCodeClick: () => void;
  isLimitReached?: boolean;
}

export function LinkingHeader({ onConnectClick, onShowQRCodeClick, isLimitReached }: LinkingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Linking Hub
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
          Manage connections between parents, students, and teachers.
        </p>
      </div>

      <div className="flex gap-3">
        {/* View QR Codes — pill shaped */}
        <Button
          onClick={onShowQRCodeClick}
          variant="outline"
          className="h-11 px-6 rounded-full font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <QrCode className="mr-2 h-4 w-4" /> View QR Codes
        </Button>

        {/* Connect with Code — pill shaped */}
        {isLimitReached ? (
          <button
            disabled
            className="inline-flex items-center h-11 px-6 rounded-full font-semibold text-sm cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none border border-slate-200 dark:border-slate-700"
          >
            <Link2 className="mr-2 h-4 w-4" /> Limit Reached
          </button>
        ) : (
          <button
            onClick={onConnectClick}
            className="inline-flex items-center justify-center overflow-hidden rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-white gap-2 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <Link2 className="mr-2 h-4 w-4" /> Connect with Code
          </button>
        )}
      </div>
    </div>
  );
}
