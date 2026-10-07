import React from 'react';
import { Sparkles, Plus, Download, Copy, FileText, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderActionsProps {
  onAutoGenerate: () => void;
  onAddPeriod: () => void;
  onDownload: () => void;
  onDownloadCSV?: () => void;
  onReplicate: () => void;
  isExporting?: boolean;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onAutoGenerate,
  onAddPeriod,
  onDownload,
  onDownloadCSV,
  onReplicate,
  isExporting
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onAutoGenerate}
          className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white dark:text-gray-900 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
        >
          <Sparkles size={18} />
          <span className="truncate">Auto-generate</span>
        </button>
        <button
          onClick={onReplicate}
          className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-purple-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-purple-700 transition-colors"
        >
          <Copy size={18} />
          <span className="truncate">Replicate</span>
        </button>
        <button
          onClick={onAddPeriod}
          className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-[#253046] text-gray-800 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-[#364563] transition-colors"
        >
          <Plus size={18} />
          <span className="truncate">Add Period</span>
        </button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            disabled={isExporting}
            className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-gray-800 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] border border-gray-300 dark:border-[#364563] hover:bg-gray-100 dark:hover:bg-[#253046] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span className="truncate">{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onDownload} className="cursor-pointer flex items-center gap-2">
            <FileText size={16} className="text-rose-500" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownloadCSV} className="cursor-pointer flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-500" />
            <span>Export as CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HeaderActions;