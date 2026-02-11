'use client';

import { Button } from './ui/Button';
import { Eye, Download, Share2, Printer, Bookmark } from 'lucide-react';

interface ActionButtonsProps {
  onView: () => void;
  onDownload: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function ActionButtons({
  onView,
  onDownload,
  onShare,
  onPrint,
  onSave,
  isSaved = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onView}
        className="flex-1 min-w-[140px]"
        size="lg"
      >
        <Eye className="mr-2 h-4 w-4" />
        View Document
      </Button>
      
      <Button
        onClick={onDownload}
        variant="outline"
        className="flex-1 min-w-[140px]"
        size="lg"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      
      <div className="flex gap-2 w-full sm:w-auto">
        {onShare && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="h-11 w-11"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        
        {onPrint && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrint}
            className="h-11 w-11"
          >
            <Printer className="h-4 w-4" />
          </Button>
        )}
        
        {onSave && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="h-11 w-11"
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
}