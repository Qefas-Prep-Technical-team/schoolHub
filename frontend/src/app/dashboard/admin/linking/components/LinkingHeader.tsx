import { Link2, UserPlus, QrCode } from 'lucide-react';
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
        <Button 
          onClick={onShowQRCodeClick}
          variant="outline"
          className="h-12 px-6 rounded-xl font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-blue-600 dark:text-blue-400"
        >
          <QrCode className="mr-2 h-5 w-5" /> View QR Codes
        </Button>
        <Button 
          onClick={onConnectClick}
          disabled={isLimitReached}
          className={cn(
             "h-12 px-6 rounded-xl font-bold transition-all",
             isLimitReached 
               ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
               : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
          )}
        >
          <Link2 className="mr-2 h-5 w-5" /> {isLimitReached ? "Limit Reached" : "Connect with Code"}
        </Button>
      </div>
    </div>
  );
}

