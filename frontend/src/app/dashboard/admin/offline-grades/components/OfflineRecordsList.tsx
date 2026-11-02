"use client";

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Award,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Info,
  Trash2,
  Loader2,
  AlertTriangle,
  FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { GradeBatchSummary, OfflineAssessmentCategory } from '../types';
import OfflineRecordsToolbar from './OfflineRecordsToolbar';
import OfflineRecordsGrid from './OfflineRecordsGrid';
import OfflineRecordsTable from './OfflineRecordsTable';

interface OfflineRecordsListProps {
  records: GradeBatchSummary[];
  classes: any[];
  isLoading: boolean;
  isTeacher?: boolean;
  hideClassFilter?: boolean;
  activeClassId?: string;
  gradingSystem?: any[];
  onAddNewRecord: (defaultCategory?: OfflineAssessmentCategory) => void;
  onEditRecord: (record: GradeBatchSummary) => void;
  onDeleteRecord: (recordId: string, record?: GradeBatchSummary) => Promise<void> | void;
  onExportPDF: (record?: GradeBatchSummary) => void;
  onExportCSV: (record?: GradeBatchSummary) => void;
  onOpenSyncModal?: () => void;
}

export type OfflineCategoryTab = 'all' | 'exam' | 'ca' | 'assignment' | 'quiz_test' | 'draft';

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CA:         { bg: 'bg-blue-50 dark:bg-blue-950/50',     text: 'text-blue-700 dark:text-blue-300',     border: 'border-blue-200 dark:border-blue-800/60' },
  QUIZ:       { bg: 'bg-amber-50 dark:bg-amber-950/50',   text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800/60' },
  MIDTERM:    { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/60' },
  ASSIGNMENT: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60' },
  EXAM:       { bg: 'bg-rose-50 dark:bg-rose-950/50',     text: 'text-rose-700 dark:text-rose-300',     border: 'border-rose-200 dark:border-rose-800/60' },
};

export default function OfflineRecordsList({
  records,
  classes,
  isLoading,
  isTeacher = false,
  hideClassFilter = false,
  activeClassId,
  gradingSystem,
  onAddNewRecord,
  onEditRecord,
  onDeleteRecord,
  onExportPDF,
  onExportCSV,
  onOpenSyncModal,
}: OfflineRecordsListProps) {
  const [activeTab, setActiveTab] = useState<OfflineCategoryTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [recordToDelete, setRecordToDelete] = useState<GradeBatchSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRequestDelete = (recordId: string, record?: GradeBatchSummary) => {
    const target = record || records.find(r => r.id === recordId) || null;
    if (target) {
      setRecordToDelete(target);
    } else {
      setRecordToDelete({
        id: recordId,
        classId: activeClassId || '',
        assessmentType: 'Offline Assessment',
        subject: 'Subject',
        className: 'Class',
        category: 'CA',
        maxMarks: 100,
        term: 'FIRST',
        sessionId: '',
        totalStudents: 0,
        gradedStudents: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'DRAFT',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteRecord(recordToDelete.id, recordToDelete);
      setRecordToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  React.useEffect(() => {
    if (activeClassId) {
      setSelectedClassId(activeClassId);
    }
  }, [activeClassId]);

  const categoryTabs = useMemo(() => [
    {
      id: 'all' as OfflineCategoryTab,
      label: 'All Records',
      shortLabel: 'All',
      icon: LayoutGrid,
      iconColor: isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400',
      activeBg: isTeacher ? 'bg-emerald-600' : 'bg-indigo-600',
      activeText: 'text-white',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'exam' as OfflineCategoryTab,
      label: 'Terminal Exams',
      shortLabel: 'Exams',
      icon: Award,
      iconColor: 'text-rose-600 dark:text-rose-400',
      activeBg: 'bg-rose-600',
      activeText: 'text-white',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'ca' as OfflineCategoryTab,
      label: 'Continuous Assessment (CA)',
      shortLabel: 'CA',
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-600',
      activeText: 'text-white',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'assignment' as OfflineCategoryTab,
      label: 'Assignments',
      shortLabel: 'Assignments',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-600',
      activeText: 'text-white',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'quiz_test' as OfflineCategoryTab,
      label: 'Quizzes / Tests',
      shortLabel: 'Quizzes / Tests',
      icon: Sparkles,
      iconColor: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-600',
      activeText: 'text-white',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'draft' as OfflineCategoryTab,
      label: 'Pending Drafts',
      shortLabel: 'Drafts',
      icon: FileEdit,
      iconColor: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-600',
      activeText: 'text-white',
      badgeActive: 'bg-white/20 text-white',
    },
  ], [isTeacher]);

  // Category Counts for Tab Badges
  const categoryCounts = useMemo(() => {
    return {
      all: records.length,
      exam: records.filter(r => r.category === 'EXAM').length,
      ca: records.filter(r => r.category === 'CA').length,
      assignment: records.filter(r => r.category === 'ASSIGNMENT').length,
      quiz_test: records.filter(r => r.category === 'QUIZ' || r.category === 'MIDTERM').length,
      draft: records.filter(r => r.status === 'DRAFT').length,
    };
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    const list = records.filter((rec) => {
      // 1. Primary Category Tab filter
      if (activeTab === 'exam' && rec.category !== 'EXAM') return false;
      if (activeTab === 'ca' && rec.category !== 'CA') return false;
      if (activeTab === 'assignment' && rec.category !== 'ASSIGNMENT') return false;
      if (activeTab === 'quiz_test' && rec.category !== 'QUIZ' && rec.category !== 'MIDTERM') return false;
      if (activeTab === 'draft' && rec.status !== 'DRAFT') return false;

      // 2. Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = rec.assessmentType.toLowerCase().includes(q);
        const matchesSubject = rec.subject.toLowerCase().includes(q);
        const matchesClass = rec.className.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesClass) return false;
      }

      // 3. Class filter (ignore if class filter is hidden, since activeClassId is already scoped by parent)
      if (!hideClassFilter && selectedClassId !== 'all' && rec.classId !== selectedClassId) {
        return false;
      }

      // 4. Secondary Category dropdown filter (if chosen while on 'all' or 'quiz_test')
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'QUIZ' || selectedCategory === 'MIDTERM') {
          if (rec.category !== selectedCategory) return false;
        } else if (rec.category !== selectedCategory) {
          return false;
        }
      }

      // 5. Status filter
      if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
        return false;
      }

      // 6. Date Range filter (today, this_week, this_month, this_term)
      if (selectedDateRange !== 'all') {
        const recordDate = new Date(rec.createdAt || rec.updatedAt);
        const now = new Date();

        if (selectedDateRange === 'today') {
          const isToday =
            recordDate.getDate() === now.getDate() &&
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (selectedDateRange === 'this_week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (recordDate < sevenDaysAgo) return false;
        } else if (selectedDateRange === 'this_month') {
          const isThisMonth =
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        } else if (selectedDateRange === 'this_term') {
          // Keep records matching current active term
          if (rec.term && rec.term !== 'FIRST') {
            // allows within reasonable 90-day window
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(now.getDate() - 90);
            if (recordDate < ninetyDaysAgo) return false;
          }
        }
      }

      return true;
    });

    // Categorized by date: ensure newest assessments appear first
    const sorted = [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return timeB - timeA;
    });

    return sorted;
  }, [records, activeTab, searchTerm, selectedClassId, selectedCategory, selectedStatus, selectedDateRange, hideClassFilter]);

  // Total KPIs
  const totalRecordsCount = records.length;
  const totalMarksRecorded = records.reduce((sum, r) => sum + r.gradedStudents, 0);
  const publishedCount = records.filter(r => r.status === 'PUBLISHED').length;
  const draftCount = records.filter(r => r.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Glow Accent */}
        <div className={`absolute top-0 right-0 -mt-14 -mr-14 w-60 h-60 ${isTeacher ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} rounded-full blur-3xl pointer-events-none`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`size-14 sm:size-16 rounded-2xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'} border flex items-center justify-center shrink-0 shadow-sm`}>
              <FileSpreadsheet className="size-7 sm:size-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Offline Assessment Marksheets
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs z-50">
                      Physical and offline assessments include continuous assessment tests, homework, quizzes, mid-terms, and terminal exams administered in classrooms.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
                Browse, filter, and manage all offline assessment marksheets. Click on any record to view or update scores, or add a new offline grade sheet.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenSyncModal && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenSyncModal}
                className={`h-11 px-4 sm:px-5 rounded-xl border ${isTeacher ? 'border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : 'border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'} font-bold text-xs sm:text-sm gap-2 shadow-xs cursor-pointer`}
              >
                <FileSpreadsheet size={16} className={isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} />
                <span>Download Grade Sheet Template</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={() => {
                const defaultCat = 
                  activeTab === 'exam' ? 'EXAM' :
                  activeTab === 'ca' ? 'CA' :
                  activeTab === 'assignment' ? 'ASSIGNMENT' :
                  activeTab === 'quiz_test' ? 'QUIZ' : undefined;
                onAddNewRecord(defaultCat);
              }}
              className={`h-11 px-5 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold text-xs sm:text-sm gap-2 shadow-md dark:shadow-none cursor-pointer`}
            >
              <Plus size={16} />
              <span>
                {activeTab === 'exam'
                  ? 'Record New Exam Marksheet'
                  : activeTab === 'ca'
                  ? 'Record New CA Marksheet'
                  : activeTab === 'assignment'
                  ? 'Record New Assignment'
                  : activeTab === 'quiz_test'
                  ? 'Record New Quiz / Test'
                  : 'Record New Offline Grade'}
              </span>
            </Button>
          </div>
        </div>

        {/* Executive KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSelectedStatus('all');
            }}
            className={`text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'all' && selectedStatus === 'all'
                ? 'bg-slate-100/80 dark:bg-slate-800/80 ring-1 ring-slate-300 dark:ring-slate-700'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Offline Records
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalRecordsCount}
            </p>
          </button>

          <div className="p-2.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student Marks Recorded
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalMarksRecorded}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus(selectedStatus === 'PUBLISHED' ? 'all' : 'PUBLISHED');
            }}
            className={`text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              selectedStatus === 'PUBLISHED'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1.5 ring-emerald-400 dark:ring-emerald-600'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="Filter by published records"
          >
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Published Records</span>
              {selectedStatus === 'PUBLISHED' && (
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {publishedCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'draft' || selectedStatus === 'DRAFT') {
                setActiveTab('all');
                setSelectedStatus('all');
              } else {
                setActiveTab('draft');
                setSelectedStatus('DRAFT');
              }
            }}
            className={`text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'draft' || selectedStatus === 'DRAFT'
                ? 'bg-amber-50 dark:bg-amber-950/40 ring-1.5 ring-amber-400 dark:ring-amber-600'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
            title="Filter by draft records"
          >
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Pending Drafts</span>
              {(activeTab === 'draft' || selectedStatus === 'DRAFT') && (
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              {draftCount}
            </p>
          </button>
        </div>
      </div>

      {/* Toolbar & Category Filters */}
      <OfflineRecordsToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        classes={classes}
        hideClassFilter={hideClassFilter}
        isTeacher={isTeacher}
        categoryTabs={categoryTabs}
        categoryCounts={categoryCounts}
      />

      {/* Main Records Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <FileSpreadsheet size={44} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Offline Assessment Records Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            {records.length === 0 
              ? 'You have not recorded any offline classroom grades or assessment sheets yet.'
              : 'No records matched your search filters. Try adjusting your query.'}
          </p>
          <Button
            type="button"
            onClick={() => {
              const defaultCat = 
                activeTab === 'exam' ? 'EXAM' :
                activeTab === 'ca' ? 'CA' :
                activeTab === 'assignment' ? 'ASSIGNMENT' :
                activeTab === 'quiz_test' ? 'QUIZ' : undefined;
              onAddNewRecord(defaultCat);
            }}
            className={`h-10 px-5 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold text-xs gap-1.5 shadow-md cursor-pointer`}
          >
            <Plus size={15} />
            <span>
              {activeTab === 'exam'
                ? 'Record First Exam Marksheet'
                : activeTab === 'ca'
                ? 'Record First CA Marksheet'
                : activeTab === 'assignment'
                ? 'Record First Assignment'
                : activeTab === 'quiz_test'
                ? 'Record First Quiz / Test'
                : 'Record First Offline Grade'}
            </span>
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <OfflineRecordsGrid
          records={filteredRecords}
          categoryColors={CATEGORY_COLORS}
          isTeacher={isTeacher}
          gradingSystem={gradingSystem}
          onEditRecord={onEditRecord}
          onDeleteRecord={handleRequestDelete}
          onExportPDF={onExportPDF}
          onExportCSV={onExportCSV}
        />
      ) : (
        <OfflineRecordsTable
          records={filteredRecords}
          categoryColors={CATEGORY_COLORS}
          isTeacher={isTeacher}
          gradingSystem={gradingSystem}
          onEditRecord={onEditRecord}
          onDeleteRecord={handleRequestDelete}
        />
      )}

      {/* Delete Confirmation Modal with Deleting Progress Indicator */}
      {recordToDelete && (
        <Dialog open={!!recordToDelete} onOpenChange={(open) => { if (!open && !isDeleting) setRecordToDelete(null); }}>
          <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="space-y-3">
              <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Delete Offline Marksheet
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{recordToDelete.assessmentType}&quot;</strong> ({recordToDelete.subject} • {recordToDelete.className})?
                <br /><br />
                This will permanently delete <strong className="text-rose-600 dark:text-rose-400">all {recordToDelete.gradedStudents || recordToDelete.totalStudents || ''} student grades</strong> recorded in this offline marksheet batch so nothing is left behind.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setRecordToDelete(null)}
                className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2 shadow-sm cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting all grades...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete All Grades</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
