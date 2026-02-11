'use client';

import Image from 'next/image';
import { Card } from './ui/Card';
import { Expand, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from './ui/IconButton';

interface DocumentThumbnailProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

export default function DocumentThumbnail({ 
  imageUrl, 
  alt, 
  className = '' 
}: DocumentThumbnailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Card className={`overflow-hidden ${className}`}>
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 right-4 flex gap-2">
              <IconButton
                variant="default"
                size="sm"
                className="bg-white/90 hover:bg-white"
                onClick={() => setIsExpanded(true)}
              >
                <Expand className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </div>
      </Card>

      {/* Expanded View Modal */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Image
              src={imageUrl}
              alt={alt}
              width={800}
              height={1067}
              className="w-full h-auto rounded-lg"
            />
            <IconButton
              variant="default"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setIsExpanded(false)}
            >
              <Expand className="h-4 w-4 rotate-45" />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
}