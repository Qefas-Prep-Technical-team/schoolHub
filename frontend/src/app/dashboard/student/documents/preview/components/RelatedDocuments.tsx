'use client';

import { Card, CardContent } from './ui/Card';
import { RelatedDocument } from './types';
import Link from 'next/link';
import { 
  History, 
  Folder, 
  FileText, 
  Download,
  ChevronRight
} from 'lucide-react';

interface RelatedDocumentsProps {
  documents: RelatedDocument[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  history: History,
  folder: Folder,
  description: FileText,
  download: Download,
};

export default function RelatedDocuments({ documents }: RelatedDocumentsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Folder className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                Related Documents
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Other relevant files
              </p>
            </div>
          </div>

          {/* Documents List */}
          <div className="flex flex-col gap-1 border-t border-gray-200 dark:border-gray-700 pt-4">
            {documents.map((doc) => {
              const Icon = iconMap[doc.icon] || FileText;
              
              return (
                <Link
                  key={doc.id}
                  href={doc.href}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    doc.active 
                      ? 'bg-primary/10 dark:bg-primary/20' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${doc.active ? 'text-primary' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'}`} />
                    <span className={`text-sm font-medium ${
                      doc.active 
                        ? 'text-primary' 
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}>
                      {doc.title}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}