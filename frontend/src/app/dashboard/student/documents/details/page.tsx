'use client';

import { useState } from 'react';
import DocumentThumbnail from './components/DocumentThumbnail';
import ActionButtons from './components/ActionButtons';
import MetadataCard from './components/MetadataCard';
import VersionHistory from './components/VersionHistory';
import TagsSection from './components/TagsSection';
import RelatedMaterials from './components/RelatedMaterials';
import {
  user,
  navItems,
  bottomNavItems,
  documentDetails,
  versions,
  tags,
  relatedMaterials,
} from './components/data';

export default function DocumentDetailsPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const metadataItems = [
    { label: 'Category', value: documentDetails.category },
    { label: 'Uploader', value: documentDetails.uploader },
    { label: 'Description', value: documentDetails.description },
    { label: 'File Size', value: documentDetails.fileSize },
    { label: 'File Type', value: documentDetails.fileType.toUpperCase() },
  ];

  const handleView = () => {
    console.log('View document:', documentDetails.id);
    // Navigate to view page or open modal
  };

  const handleDownload = () => {
    console.log('Download document:', documentDetails.id);
    // Implement download logic
  };

  const handleShare = () => {
    console.log('Share document:', documentDetails.id);
    // Implement share logic
  };

  const handlePrint = () => {
    console.log('Print document:', documentDetails.id);
    // Implement print logic
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log('Toggle save:', documentDetails.id, !isSaved);
    // Implement save logic
  };

  const handleTagClick = (tagId: string) => {
    console.log('Tag clicked:', tagId);
    // Filter documents by tag
  };

  const handleDownloadVersion = (versionId: string) => {
    console.log('Download version:', versionId);
    // Implement version download
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed md:relative z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {documentDetails.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {documentDetails.subtitle}
              </p>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden mb-6 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <span className="sr-only">Toggle menu</span>
              <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400"></div>
            </button>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column: Thumbnail */}
              <div className="lg:col-span-1">
                <DocumentThumbnail
                  imageUrl={documentDetails.thumbnailUrl}
                  alt={documentDetails.thumbnailAlt}
                />
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Action Buttons */}
                <ActionButtons
                  onView={handleView}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onPrint={handlePrint}
                  onSave={handleSave}
                  isSaved={isSaved}
                />

                {/* Metadata Card */}
                <MetadataCard items={metadataItems} />

                {/* Version History */}
                <VersionHistory
                  versions={versions}
                  onDownloadVersion={handleDownloadVersion}
                />

                {/* Tags */}
                <TagsSection
                  tags={tags}
                  onTagClick={handleTagClick}
                />

                {/* Related Materials */}
                <RelatedMaterials materials={relatedMaterials} />
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last accessed: Today at 2:30 PM
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    Report issue
                  </button>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    Request edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}