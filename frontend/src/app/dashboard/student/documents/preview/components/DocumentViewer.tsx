'use client';

import { Card, CardContent } from './ui/Card';
import Image from 'next/image';
import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import { Button } from './ui/Button';

interface DocumentViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

export default function DocumentViewer({ 
  imageUrl, 
  alt, 
  className = '' 
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <Card className={`overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}>
      <CardContent className="p-4 sm:p-6">
        {/* Viewer Controls */}
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="relative w-full min-h-[600px] md:min-h-[800px] rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div 
              className="relative w-full h-full bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage: `url(${imageUrl})`,
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Fallback for image loading */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 dark:text-gray-600 mb-2">
                    Loading document preview...
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {alt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center justify-between mt-4 p-2">
          <Button variant="ghost" size="sm">
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page
            </span>
            <input
              type="number"
              min="1"
              max="10"
              defaultValue="1"
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              of 10
            </span>
          </div>
          
          <Button variant="ghost" size="sm">
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}