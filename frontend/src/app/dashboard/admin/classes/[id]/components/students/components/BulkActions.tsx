import React from 'react';
import { Download, Megaphone, Loader2 } from 'lucide-react';

interface BulkActionsProps {
  onExport?: () => void;
  onSendAnnouncement?: () => void;
  isExporting?: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  onExport,
  onSendAnnouncement,
  isExporting
}) => {
  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-wrap gap-x-6 gap-y-3">
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin text-primary" /> : <Download size={18} />}
        {isExporting ? 'Exporting...' : 'Export Class List'}
      </button>
      
      <button
        onClick={onSendAnnouncement}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
      >
        <Megaphone size={18} />
        Send Announcement
      </button>
    </div>
  );
};

export default BulkActions;