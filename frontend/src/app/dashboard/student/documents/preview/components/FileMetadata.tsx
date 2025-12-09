import { Card, CardContent } from './ui/Card';
import { MetadataItem } from './types';
import { Info } from 'lucide-react';

interface FileMetadataProps {
  items: MetadataItem[];
  title?: string;
}

export default function FileMetadata({ 
  items, 
  title = "File Metadata" 
}: FileMetadataProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="text-base font-medium text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>

          {/* Metadata Items */}
          <ul className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="flex justify-between items-center py-1"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}