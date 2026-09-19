import { Link2, QrCode } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TeacherLinkingHeaderProps {
  onConnectClick: () => void;
  onShowQRCodeClick: () => void;
}

export function TeacherLinkingHeader({ onConnectClick, onShowQRCodeClick }: TeacherLinkingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Linking Hub
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
          Onboard students and manage your school connections.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* View QR Hub — outline style, works fine with Button */}
        <Button
          onClick={onShowQRCodeClick}
          variant="outline"
          className="h-14 px-8 rounded-2xl font-black bg-white dark:bg-gray-800/60 border-2 border-gray-100 dark:border-gray-700/60 shadow-sm hover:scale-105 active:scale-95 transition-all text-green-600 dark:text-green-400 dark:hover:bg-gray-700/60"
        >
          <QrCode className="mr-2 h-5 w-5" /> View QR Hub
        </Button>

        {/* Connect with Code — raw button to avoid CVA bg-primary override in dark mode */}
        <button
          onClick={onConnectClick}
          className="
            inline-flex items-center gap-2
            h-14 px-8 rounded-2xl font-black text-sm cursor-pointer
            text-white
            transition-all duration-300 ease-out
            bg-green-600 hover:bg-green-700
            shadow-lg shadow-green-500/25
            dark:bg-gradient-to-r dark:from-green-500 dark:to-emerald-600
            dark:hover:from-green-400 dark:hover:to-emerald-500
            dark:shadow-[0_4px_24px_rgba(34,197,94,0.35)]
            dark:hover:shadow-[0_4px_32px_rgba(34,197,94,0.55)]
            hover:scale-105 active:scale-95
          "
        >
          <Link2 className="h-5 w-5 shrink-0" />
          Connect with Code
        </button>
      </div>
    </div>
  );
}
