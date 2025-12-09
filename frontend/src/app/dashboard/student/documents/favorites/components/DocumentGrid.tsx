'use client';

import { ImportantDocument } from './types';
import ImportantDocumentCard from './ImportantDocumentCard';
import EmptyState from './EmptyState';
import { useState } from 'react';

interface DocumentGridProps {
  documents: ImportantDocument[];
  onStarToggle: (id: string) => void;
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  onMore?: (id: string) => void;
}

export default function DocumentGrid({
  documents,
  onStarToggle,
  onView,
  onDownload,
  onMore,
}: DocumentGridProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'recent'>('all');

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'unread') return doc.isUnread;
    if (filter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return doc.uploadDate >= oneWeekAgo;
    }
    return true;
  });

  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredDocuments.length} of {documents.length} documents
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filter === 'recent'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <ImportantDocumentCard
            key={document.id}
            document={document}
            onStarToggle={onStarToggle}
            onView={onView}
            onDownload={onDownload}
            onMore={onMore}
          />
        ))}

        {/* Show empty state if no filtered documents */}
        {filteredDocuments.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3">
            <EmptyState
              title={`No ${filter === 'unread' ? 'unread' : 'recent'} documents`}
              description={`You don't have any ${filter === 'unread' ? 'unread' : filter === 'recent' ? 'recent' : ''} important documents.`}
              actionText="View all documents"
            />
          </div>
        )}
      </div>
    </div>
  );
}