'use client';

import { Document } from './types';
import { format } from 'date-fns';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { 
  Eye, 
  Download, 
  Heart,
  FileText,
  File,
  Image as ImageIcon,
  Award
} from 'lucide-react';
import { iconColors } from './data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DocumentCardProps {
  document: Document;
  onFavorite: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  picture_as_pdf: FileText,
  description: File,
  image: ImageIcon,
  emoji_events: Award,
};

export default function DocumentCard({ 
  document, 
  onFavorite, 
  onView, 
  onDownload 
}: DocumentCardProps) {
  const Icon = iconMap[document.icon] || FileText;

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-5">
        <Link className="flex flex-col h-full" href={"/dashboard/student/documents/details"}>
        <div className="flex flex-col h-full">
          {/* Header with icon and title */}
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              iconColors[document.iconColor]
            )}>
              <Icon className="text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {document.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {document.category}
                  </p>
                </div>
                <button
                  onClick={() => onFavorite(document.id)}
                  className="ml-2 flex-shrink-0"
                >
                  <Heart
                    className={cn(
                      'w-5 h-5 transition-colors',
                      document.isFavorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Upload date */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Uploaded: {format(document.uploadDate, 'dd MMM yyyy')}
          </p>

          {/* Action buttons */}
          <div className="mt-auto grid grid-cols-2 gap-3">
           
            
            <Button
              variant="outline"
              size="sm"
              className="h-10 cursor-pointer"
              onClick={() => onView(document.id)}
              link="/dashboard/student/documents/preview"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="h-10"
              onClick={() => onDownload(document.id)}
              link=""
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        </Link>
      </CardContent>
    </Card>
  );
}