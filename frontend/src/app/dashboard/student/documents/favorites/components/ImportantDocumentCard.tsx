'use client';

import { ImportantDocument } from './types';
import { formatDistanceToNow } from 'date-fns';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';
import StatusBadge from './StatusBadge';
import {
  CalendarDays,
  BookOpen,
  FileText,
  File,
  MoreVertical,
  Star,
  Download,
  Eye,
} from 'lucide-react';
import { useState } from 'react';

interface ImportantDocumentCardProps {
  document: ImportantDocument;
  onStarToggle: (id: string) => void;
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  onMore?: (id: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar_month: CalendarDays,
  menu_book: BookOpen,
  picture_as_pdf: FileText,
  description: File,
};

export default function ImportantDocumentCard({
  document,
  onStarToggle,
  onView,
  onDownload,
  onMore,
}: ImportantDocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[document.icon] || FileText;

  const formattedDate = formatDistanceToNow(document.uploadDate, { addSuffix: true });

  return (
    <Card
      className="group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Header with Icon and Star */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex items-center gap-1">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => onStarToggle(document.id)}
              className={`h-8 w-8 ${
                document.isStarred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Star className={`w-4 h-4 ${document.isStarred ? 'fill-current' : ''}`} />
            </IconButton>
          </div>
        </div>

        {/* Document Info */}
        <div className="space-y-2 mb-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
            {document.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {document.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Uploaded {formattedDate}
          </p>
        </div>

        {/* Footer with Status and Actions */}
        <div className="flex items-center justify-between">
          {/* Status Badge */}
          {document.isUnread && <StatusBadge type="unread" />}

          {/* Action Buttons (Visible on Hover) */}
          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {onView && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onView(document.id)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </IconButton>
            )}
            
            {onDownload && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onDownload(document.id)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </IconButton>
            )}
            
            {onMore && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => onMore(document.id)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        </div>

        {/* Additional Info (Visible on Hover) */}
        {isHovered && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              {document.fileType && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {document.fileType}
                </span>
              )}
              {document.fileSize && (
                <span>{document.fileSize}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}