'use client';

import { Document } from './types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Download, Printer, Share2, MoreVertical } from 'lucide-react';

interface DocumentHeaderProps {
  document: Document;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onMore?: () => void;
}

export default function DocumentHeader({ 
  document,
  onDownload,
  onPrint,
  onShare,
  onMore 
}: DocumentHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* Document Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
              {document.title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              {document.description}
            </p>
            
            {/* Tags/Metadata */}
            <div className="flex items-center gap-2 mt-4">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {document.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {document.fileSize}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                •
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded by {document.uploadedBy}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onDownload}
              className="h-11 w-11"
            >
              <Download className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={onPrint}
              className="h-11 w-11"
            >
              <Printer className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={onShare}
              className="h-11 w-11"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            
            <IconButton
              variant="ghost"
              size="default"
              onClick={onMore}
              className="h-11 w-11"
            >
              <MoreVertical className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}