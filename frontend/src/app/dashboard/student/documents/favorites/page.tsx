'use client';

import { useState } from 'react';
import ImportantSidebar from './components/ImportantSidebar';
import PageHeader from './components/PageHeader';
import DocumentGrid from './components/DocumentGrid';
import EmptyState from './components/EmptyState';
import {
  user,
  navItems,
  bottomNavItems,
  importantDocuments,
} from './components/data';

export default function ImportantDocumentsPage() {
  const [documents, setDocuments] = useState(importantDocuments);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleStarToggle = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, isStarred: !doc.isStarred } : doc
    ));
  };

  const handleView = (id: string) => {
    console.log('View document:', id);
    // Implement view logic
  };

  const handleDownload = (id: string) => {
    console.log('Download document:', id);
    // Implement download logic
  };

  const handleMore = (id: string) => {
    console.log('More options for document:', id);
    // Implement more options logic
  };

  const handleMarkAllAsRead = () => {
    setDocuments(documents.map(doc => ({ ...doc, isUnread: false })));
  };

  const pinnedDocuments = documents.filter(doc => doc.isStarred);

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
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-6xl">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <PageHeader
                title="Important Documents"
                description="These documents are essential for your academic activities."
              />
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
                
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <span className="sr-only">Toggle menu</span>
                  <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400 mb-1"></div>
                  <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400 mb-1"></div>
                  <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-400"></div>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Pinned</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pinnedDocuments.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-lg">📌</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pinnedDocuments.filter(d => d.isUnread).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <span className="text-blue-500 dark:text-blue-300 text-lg">🔔</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recent (7d)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pinnedDocuments.filter(d => {
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return d.uploadDate >= oneWeekAgo;
                      }).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <span className="text-green-500 dark:text-green-300 text-lg">🕐</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Grid */}
            {pinnedDocuments.length > 0 ? (
              <DocumentGrid
                documents={pinnedDocuments}
                onStarToggle={handleStarToggle}
                onView={handleView}
                onDownload={handleDownload}
                onMore={handleMore}
              />
            ) : (
              <EmptyState
                title="No Pinned Documents"
                description="You haven't starred any documents yet. Find important documents and click the star icon to pin them here."
                actionText="Browse All Documents"
                actionHref="/documents"
              />
            )}

            {/* Tips Section */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tips for Managing Important Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Star Important Items</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Click the star icon on any document to add it to this pinned section.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📁</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Organize by Priority</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Keep your most critical documents (like financial aid or registration forms) pinned for quick access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}