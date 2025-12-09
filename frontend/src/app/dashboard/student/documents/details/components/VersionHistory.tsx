'use client';

import { Card, CardContent } from './ui/Card';
import { Version } from './types';
import { format } from 'date-fns';
import { Download, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface VersionHistoryProps {
  versions: Version[];
  onDownloadVersion?: (versionId: string) => void;
}

export default function VersionHistory({ 
  versions, 
  onDownloadVersion 
}: VersionHistoryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Version History
        </h3>
        
        <div className="flex flex-col gap-4">
          {versions.map((version) => (
            <div 
              key={version.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                version.isCurrent 
                  ? 'bg-primary/5 border border-primary/10' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {version.number}
                    </p>
                    {version.isCurrent && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Uploaded {format(version.uploadDate, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {version.fileSize}
                </p>
                
                {onDownloadVersion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadVersion(version.id)}
                    className="h-8 w-8"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}