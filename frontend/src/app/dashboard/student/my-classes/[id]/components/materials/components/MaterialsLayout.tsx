'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from './PageHeader';
import FoldersSidebar from './FoldersSidebar';
import SearchAndView from './SearchAndView';
import MaterialsList from './MaterialsList';
import UploadMaterialModal from './UploadMaterialModal';
import { MaterialCard, MaterialSubTab, RoleTheme, getThemeTokens } from './types';
import { 
  X, 
  ExternalLink, 
  Download, 
  Layers,
  FileDown, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  HelpCircle,
  ArrowRight,
  Upload,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

interface MaterialsLayoutProps {
  materials: MaterialCard[];
  className: string;
  description: string;
  classId?: string;
  schoolId?: string;
  subjects?: Array<{ id?: string; name?: string }>;
  canUpload?: boolean;
  onRefresh?: () => void;
  accentRole?: RoleTheme;
}

export default function MaterialsLayout({ 
  materials, 
  className, 
  description,
  classId,
  schoolId,
  subjects,
  canUpload = true,
  onRefresh,
  accentRole = 'student'
}: MaterialsLayoutProps) {
  const [selectedSubTab, setSelectedSubTab] = useState<MaterialSubTab>('ALL');
  const [selectedFolder, setSelectedFolder] = useState('All Materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [activePreview, setActivePreview] = useState<MaterialCard | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const theme = getThemeTokens(accentRole);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  // Compute resource stream counts
  const counts = useMemo(() => {
    let all = materials.length;
    let filesOnly = 0;
    let exams = 0;
    let assignments = 0;
    let ca = 0;
    let testQuiz = 0;

    materials.forEach((m) => {
      if (m.isFile) filesOnly++;
      if (m.folder === 'Exams' || m.sourceType === 'EXAM') exams++;
      if (m.folder === 'Assignments' || m.sourceType === 'ASSIGNMENT') assignments++;
      if (m.folder === 'CA' || m.sourceType === 'CA') ca++;
      if (m.folder === 'Test (Quiz)' || m.sourceType === 'QUIZ') testQuiz++;
    });

    return { all, filesOnly, exams, assignments, ca, testQuiz };
  }, [materials]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (selectedSubTab === 'FILES_ONLY' && !material.isFile) return false;
      if (selectedSubTab === 'EXAMS' && material.folder !== 'Exams' && material.sourceType !== 'EXAM') return false;
      if (selectedSubTab === 'ASSIGNMENTS' && material.folder !== 'Assignments' && material.sourceType !== 'ASSIGNMENT') return false;
      if (selectedSubTab === 'CA' && material.folder !== 'CA' && material.sourceType !== 'CA') return false;
      if (selectedSubTab === 'TEST_QUIZ' && material.folder !== 'Test (Quiz)' && material.sourceType !== 'QUIZ') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = material.title.toLowerCase().includes(q);
        const matchesTeacher = material.teacher.toLowerCase().includes(q);
        const matchesType = material.type.toLowerCase().includes(q);
        const matchesAssessment = (material.assessmentName || material.assignmentTitle || material.sourceTitle || '').toLowerCase().includes(q);
        const matchesSubject = (material.subjectName || '').toLowerCase().includes(q);

        if (!matchesTitle && !matchesTeacher && !matchesType && !matchesAssessment && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }, [materials, selectedSubTab, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedSubTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const paginatedMaterials = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, page, pageSize]);

  // Robust YouTube embed link parser (handles youtu.be, youtube.com/watch?v=, youtube.com/shorts/, youtube.com/embed/)
  const getYoutubeEmbedUrl = (rawUrl?: string | null): string | null => {
    if (!rawUrl) return null;
    try {
      const u = new URL(rawUrl);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace(/^\//, '');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.hostname.includes('youtube.com')) {
        const searchId = u.searchParams.get('v');
        if (searchId) return `https://www.youtube.com/embed/${searchId}`;
        const match = u.pathname.match(/\/(embed|v|shorts)\/([^/?]+)/);
        if (match && match[2]) return `https://www.youtube.com/embed/${match[2]}`;
      }
      if (u.hostname.includes('vimeo.com')) {
        const match = u.pathname.match(/\/(\d+)/);
        if (match && match[1]) return `https://player.vimeo.com/video/${match[1]}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const previewVideoUrl = activePreview?.videoUrl || (activePreview?.type === 'video' ? activePreview?.attachmentUrl : null);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(previewVideoUrl);
  const isDirectVideo = activePreview?.type === 'video' && Boolean(previewVideoUrl) && !youtubeEmbedUrl;

  const previewPdfUrl = activePreview?.type === 'pdf' ? (activePreview?.attachmentUrl || activePreview?.referenceUrl) : null;
  const isPdf = activePreview?.type === 'pdf' || (activePreview?.attachmentUrl && activePreview.attachmentUrl.toLowerCase().endsWith('.pdf'));

  return (
    <div className="w-full relative space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader 
          title="Class Materials & Resources"
          subtitle={`Access study documents, curriculum sheets, and assignment attachments for ${className}.`}
        />

        {canUpload && classId && (
          <Button
            onClick={() => setIsUploadOpen(true)}
            className={cn(
              "h-11 px-5 rounded-2xl text-white font-bold text-xs sm:text-sm gap-2 shrink-0 cursor-pointer shadow-md",
              theme.primary,
              theme.primaryHover
            )}
          >
            <Upload size={16} />
            <span>Upload Material</span>
          </Button>
        )}
      </div>

      {/* Horizontal Filter Sub-Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/80 dark:border-slate-800">
        {[
          { id: 'ALL' as const, label: 'All Resources', count: counts.all, icon: Layers },
          { id: 'FILES_ONLY' as const, label: 'Files Only', count: counts.filesOnly, icon: FileDown },
          { id: 'ASSIGNMENTS' as const, label: 'Assignments', count: counts.assignments, icon: BookOpen },
          { id: 'EXAMS' as const, label: 'Exams', count: counts.exams, icon: GraduationCap },
          { id: 'CA' as const, label: 'Continuous Assessment', count: counts.ca, icon: ClipboardCheck },
          { id: 'TEST_QUIZ' as const, label: 'Quizzes / Tests', count: counts.testQuiz, icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedSubTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setSelectedSubTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap border cursor-pointer transition-all",
                isSelected
                  ? `${theme.primary} text-white ${theme.primaryBorder} shadow-sm`
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Icon size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <FoldersSidebar 
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          selectedSubTab={selectedSubTab}
          onSubTabSelect={setSelectedSubTab}
          counts={counts}
          role={accentRole}
        />
        
        <div className="flex-1 space-y-5 min-w-0">
          <SearchAndView 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          <MaterialsList 
            materials={paginatedMaterials}
            viewMode={viewMode}
            onPreview={setActivePreview}
            accentRole={accentRole}
            emptyMessage={
              selectedSubTab !== 'ALL' 
                ? `No items found under "${selectedSubTab.replace('_', ' ')}"`
                : "No study materials match your search"
            }
          />

          {/* Pagination Controls */}
          {filteredMaterials.length > pageSize && (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">
                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredMaterials.length)} of {filteredMaterials.length}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-2.5 rounded-xl text-xs gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </Button>

                <span className="text-xs font-black text-slate-700 dark:text-slate-300 px-2 font-mono">
                  {page} / {totalPages}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-2.5 rounded-xl text-xs gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── File Preview Modal with Robust PDF / Video / Image Rendering ───────────────── */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 transition-all animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    theme.badgeBg,
                    theme.badgeText,
                    theme.badgeBorder
                  )}>
                    {activePreview.folder}
                  </span>
                  <span className="text-xs text-slate-400">• {activePreview.type.toUpperCase()}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {activePreview.title}
                </h3>
              </div>
              <button 
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Linked Assessment Banner */}
              <div className={cn(
                "p-3.5 rounded-2xl border flex items-center justify-between gap-3",
                theme.badgeBg,
                theme.badgeBorder
              )}>
                <div className="space-y-0.5 min-w-0">
                  <span className={cn("text-[10px] font-black uppercase tracking-wider block", theme.primaryText)}>
                    Associated Assessment
                  </span>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {activePreview.assessmentName || activePreview.assignmentTitle || activePreview.sourceTitle}
                  </p>
                </div>
                {activePreview.link && (
                  <Link href={activePreview.link}>
                    <Button size="sm" className={cn("h-8 rounded-xl text-white font-bold text-xs gap-1.5 shrink-0 cursor-pointer", theme.primary, theme.primaryHover)}>
                      <span>Go to Assessment</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                )}
              </div>

              {/* YouTube / Vimeo Video Embed Player */}
              {youtubeEmbedUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200 dark:border-slate-800">
                  <iframe 
                    src={youtubeEmbedUrl} 
                    className="w-full h-full border-0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  />
                </div>
              )}

              {/* Direct HTML5 Video Player */}
              {isDirectVideo && (
                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200 dark:border-slate-800">
                  <video 
                    controls 
                    className="w-full max-h-96" 
                    src={previewVideoUrl!}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Image Preview */}
              {activePreview.type === 'image' && activePreview.attachmentUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center max-h-96 p-2">
                  <img 
                    src={activePreview.attachmentUrl} 
                    alt={activePreview.title} 
                    className="object-contain max-h-92 w-full rounded-xl"
                  />
                </div>
              )}

              {/* PDF Document Preview via Inline Google Docs Viewer or Direct PDF Stream */}
              {isPdf && activePreview.attachmentUrl && (
                <div className="space-y-2">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 h-[420px] w-full relative">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(activePreview.attachmentUrl)}&embedded=true`}
                      className="w-full h-full border-0"
                      title={activePreview.title}
                    />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] text-slate-400">
                      If the document does not render above, use the action buttons below to open directly.
                    </p>
                    <a
                      href={activePreview.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn("text-xs font-bold hover:underline flex items-center gap-1", theme.primaryText)}
                    >
                      <ExternalLink size={12} />
                      <span>Full screen view</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Description & Reading Content */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instructions & Notes</h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-56 overflow-y-auto">
                  <LaTeXRenderer content={activePreview.description || 'No instructions or description provided.'} />
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Author / Teacher</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activePreview.teacher}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Published Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activePreview.uploadDate}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
              {activePreview.attachmentUrl && (
                <>
                  <a 
                    href={activePreview.attachmentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <Button variant="outline" className="h-10 rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
                      <ExternalLink size={14} />
                      <span>Open File in New Tab</span>
                    </Button>
                  </a>

                  <a 
                    href={activePreview.attachmentUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    download
                  >
                    <Button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer">
                      <Download size={14} />
                      <span>Download File</span>
                    </Button>
                  </a>
                </>
              )}

              {activePreview.videoUrl && (
                <a href={activePreview.videoUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="h-10 rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
                    <ExternalLink size={14} />
                    <span>Watch on Source Video Player</span>
                  </Button>
                </a>
              )}

              {activePreview.referenceUrl && (
                <a href={activePreview.referenceUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="h-10 rounded-xl text-xs font-bold gap-1.5 cursor-pointer">
                    <ExternalLink size={14} />
                    <span>Open Reference</span>
                  </Button>
                </a>
              )}

              <Button 
                variant="ghost" 
                onClick={() => setActivePreview(null)}
                className="h-10 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Material Modal - Only accessible if user has upload permissions */}
      {canUpload && isUploadOpen && classId && (
        <UploadMaterialModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          classId={classId}
          className={className}
          schoolId={schoolId}
          subjects={subjects}
          onSuccess={() => onRefresh?.()}
        />
      )}
    </div>
  );
}
