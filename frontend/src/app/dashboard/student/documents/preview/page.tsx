'use client';

import { useState } from 'react';

import Breadcrumbs from './components/Breadcrumbs';
import DocumentHeader from './components/DocumentHeader';
import DocumentViewer from './components/DocumentViewer';
import RelatedDocuments from './components/RelatedDocuments';
import FileMetadata from './components/FileMetadata';
import {
  currentDocument,
  relatedDocuments,
  metadataItems,
  breadcrumbs,
  user
} from './components/data';

export default function DocumentPreviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDownload = () => {
    console.log('Downloading document:', currentDocument.id);
    // Implement download logic
  };

  const handlePrint = () => {
    console.log('Printing document:', currentDocument.id);
    // Implement print logic
  };

  const handleShare = () => {
    console.log('Sharing document:', currentDocument.id);
    // Implement share logic
  };

  const handleMore = () => {
    console.log('More options for document:', currentDocument.id);
    // Implement more options
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Main Content - Left Column */}
          <div className="flex-1 lg:w-2/3 space-y-6">
            {/* Document Header */}
            <DocumentHeader
              document={currentDocument}
              onDownload={handleDownload}
              onPrint={handlePrint}
              onShare={handleShare}
              onMore={handleMore}
            />

            {/* Document Viewer */}
            <DocumentViewer
              imageUrl={currentDocument.previewImage}
              alt={currentDocument.title}
            />
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:w-1/3 space-y-6">
            {/* Related Documents */}
            <RelatedDocuments documents={relatedDocuments} />

            {/* File Metadata */}
            <FileMetadata items={metadataItems} />
          </div>
        </div>
      </main>
    </div>
  );
}