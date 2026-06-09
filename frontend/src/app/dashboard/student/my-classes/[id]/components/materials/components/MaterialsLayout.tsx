'use client';

// app/student/classes/[id]/materials/components/MaterialsLayout.tsx
import { useState } from 'react';
import PageHeader from './PageHeader';
import FoldersSidebar from './FoldersSidebar';
import SearchAndView from './SearchAndView';
import MaterialsList from './MaterialsList';
import { X, ExternalLink, Download, FileText, Youtube, Play, Check } from 'lucide-react';

interface MaterialsLayoutProps {
  materials: any[];
  className: string;
  description: string;
}

export default function MaterialsLayout({ materials, className, description }: MaterialsLayoutProps) {
  const [selectedFolder, setSelectedFolder] = useState('All Materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activePreview, setActivePreview] = useState<any | null>(null);

  const folders = ['All Materials', 'Exams', 'Assignments', 'CA', 'Test (Quiz)'];

  const filteredMaterials = materials.filter((material) => {
    // Folder filter
    if (selectedFolder !== 'All Materials' && material.folder !== selectedFolder) {
      return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        material.title.toLowerCase().includes(query) ||
        material.teacher.toLowerCase().includes(query) ||
        material.type.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const getYoutubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const youtubeEmbedUrl = activePreview ? getYoutubeEmbedUrl(activePreview.videoUrl) : null;

  return (
    <div className="max-w-7xl mx-auto relative">
      <PageHeader 
        title="Study Materials"
        subtitle={description}
      />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        <FoldersSidebar 
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
        />
        
        <div className="flex-1">
          <SearchAndView 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          <div className="mt-6">
            <MaterialsList 
              materials={filteredMaterials}
              viewMode={viewMode}
              onPreview={setActivePreview}
              emptyMessage={
                selectedFolder !== 'All Materials' 
                  ? `No materials found in "${selectedFolder}"`
                  : "No materials found"
              }
            />
          </div>
        </div>
      </div>

      {/* ── Preview Popup Modal ─────────────────────────────────────── */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0 flex-1 pr-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 mb-1">
                  {activePreview.folder}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                  {activePreview.title}
                </h3>
                {activePreview.assignmentTitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    From: <span className="font-semibold text-slate-600 dark:text-slate-300">{activePreview.assignmentTitle}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Media Preview Containers */}
              <div className="flex flex-col gap-6">
                {youtubeEmbedUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
                    <iframe
                      className="w-full h-full"
                      src={youtubeEmbedUrl}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
                
                {activePreview.videoUrl && !youtubeEmbedUrl && (
                  <div className="w-full rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
                    <video 
                      src={activePreview.videoUrl} 
                      controls 
                      className="w-full aspect-video"
                    />
                  </div>
                )}

                {activePreview.attachmentUrl && (
                  activePreview.attachmentUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
                    <div className="w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex justify-center items-center p-2">
                      <img 
                        src={activePreview.attachmentUrl} 
                        alt={activePreview.title} 
                        className="max-h-[50vh] object-contain rounded-lg"
                      />
                    </div>
                  ) : activePreview.attachmentUrl.match(/\.pdf$/i) ? (
                    <div className="w-full h-[50vh] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <iframe 
                        src={activePreview.attachmentUrl} 
                        title={activePreview.title}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-center p-3 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {activePreview.title.split('/').pop() || activePreview.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Attached Document file resource
                        </p>
                      </div>
                      <a
                        href={activePreview.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                        title="Download File"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  )
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Description / Instructions
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                  {activePreview.description}
                </div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 uppercase font-semibold">Teacher / Instructor</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{activePreview.teacher}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 uppercase font-semibold">Date Added</p>
                  <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{activePreview.uploadDate}</p>
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
              {activePreview.referenceUrl && (
                <a
                  href={activePreview.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Reference Link
                </a>
              )}

              {activePreview.attachmentUrl && (
                <a
                  href={activePreview.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download Resource
                </a>
              )}

              <button
                onClick={() => setActivePreview(null)}
                className="px-4 py-2 text-sm font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}