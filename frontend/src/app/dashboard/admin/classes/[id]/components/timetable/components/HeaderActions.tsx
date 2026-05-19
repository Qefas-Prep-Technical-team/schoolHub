import React from 'react';
import { Sparkles, Plus, Download, Copy } from 'lucide-react';
import Link from 'next/link';

interface HeaderActionsProps {
  onAutoGenerate: () => void;
  onAddPeriod: () => void;
  onDownload: () => void;
  onReplicate: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onAutoGenerate,
  onAddPeriod,
  onDownload,
  onReplicate
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onAutoGenerate}
          className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
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
      
      <button
        onClick={onDownload}
        className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-gray-800 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] border border-gray-300 dark:border-[#364563] hover:bg-gray-100 dark:hover:bg-[#253046] transition-colors"
      >
        <Download size={18} />
        <span className="truncate">Download</span>
      </button>
    </div>
  );
};

export default HeaderActions;