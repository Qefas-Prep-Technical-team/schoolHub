import React from 'react';
import { Download, Megaphone, Printer } from 'lucide-react';

interface BulkActionsProps {
  onExport?: () => void;
  onSendAnnouncement?: () => void;
  onPrintAttendance?: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  onExport,
  onSendAnnouncement,
  onPrintAttendance
}) => {
  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-wrap gap-x-6 gap-y-3">
      <button
        onClick={onExport}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
      >
        <Download size={18} />
        Export Class List
      </button>
      
      <button
        onClick={onSendAnnouncement}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
      >
        <Megaphone size={18} />
        Send Announcement
      </button>
      
      <button
        onClick={onPrintAttendance}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
      >
        <Printer size={18} />
        Print Attendance Sheet
      </button>
    </div>
  );
};

export default BulkActions;