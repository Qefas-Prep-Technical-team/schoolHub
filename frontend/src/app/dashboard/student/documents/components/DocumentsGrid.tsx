'use client';

import { Document } from './types';
import DocumentCard from './DocumentCard';

interface DocumentsGridProps {
  documents: Document[];
  onFavorite: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

export default function DocumentsGrid({ 
  documents, 
  onFavorite, 
  onView, 
  onDownload 
}: DocumentsGridProps) {
  if (documents.length === 0) {
    return (
      <div className="col-span-full mt-16 flex flex-col items-center justify-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Documents Found</h2>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Your document library is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onFavorite={onFavorite}
          onView={onView}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}