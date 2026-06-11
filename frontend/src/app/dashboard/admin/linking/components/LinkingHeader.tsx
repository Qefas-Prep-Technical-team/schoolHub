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
        {/* View QR Codes — outline, fine with Button */}
        <Button
          onClick={onShowQRCodeClick}
          variant="outline"
          className="h-12 px-6 rounded-xl font-bold bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-blue-600 dark:text-blue-400 dark:hover:bg-gray-700/60"
        >
          <QrCode className="mr-2 h-5 w-5" /> View QR Codes
        </Button>

        {/* Connect with Code — raw button for dark mode gradient support */}
        {isLimitReached ? (
          <button
            disabled
            className="inline-flex items-center h-12 px-6 rounded-xl font-bold text-sm cursor-not-allowed bg-gray-200 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500 shadow-none"
          >
            <Link2 className="mr-2 h-5 w-5" /> Limit Reached
          </button>
        ) : (
          <button
            onClick={onConnectClick}
            className={cn(
              "inline-flex items-center h-12 px-6 rounded-xl font-bold text-sm cursor-pointer text-white transition-all duration-300",
              "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20",
              "dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600",
              "dark:hover:from-indigo-400 dark:hover:to-violet-500",
              "dark:shadow-[0_4px_20px_rgba(99,102,241,0.35)]",
              "dark:hover:shadow-[0_4px_28px_rgba(99,102,241,0.55)]",
              "hover:scale-[1.02] active:scale-95"
            )}
          >
            <Link2 className="mr-2 h-5 w-5" /> Connect with Code
          </button>
        )}
      </div>
    </div>
  );
}
