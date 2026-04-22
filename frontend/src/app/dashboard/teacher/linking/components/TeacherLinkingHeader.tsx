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
        <Button 
          onClick={onShowQRCodeClick}
          variant="outline"
          className="h-14 px-8 rounded-2xl font-black bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 shadow-sm hover:scale-105 active:scale-95 transition-all text-primary"
        >
          <QrCode className="mr-2 h-5 w-5" /> View QR Hub
        </Button>
        <Button 
          onClick={onConnectClick}
          className="h-14 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
        >
          <Link2 className="mr-2 h-5 w-5" /> Connect with Code
        </Button>
      </div>
    </div>
  );
}
