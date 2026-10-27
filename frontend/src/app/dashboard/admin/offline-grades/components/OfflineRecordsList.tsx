"use client";

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Eye,
  TrendingUp,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
  Info,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { GradeBatchSummary, OfflineAssessmentCategory } from '../types';

interface OfflineRecordsListProps {
  records: GradeBatchSummary[];
  classes: any[];
  isLoading: boolean;
  isTeacher?: boolean;
  hideClassFilter?: boolean;
  activeClassId?: string;
  onAddNewRecord: (defaultCategory?: OfflineAssessmentCategory) => void;
  onEditRecord: (record: GradeBatchSummary) => void;
  onDeleteRecord: (recordId: string) => void;
  onExportPDF: (record?: GradeBatchSummary) => void;
  onExportCSV: (record?: GradeBatchSummary) => void;
}

export type OfflineCategoryTab = 'all' | 'exam' | 'ca' | 'assignment' | 'quiz_test';

export const CATEGORY_TABS: {
  id: OfflineCategoryTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  iconColor: string;
  activeBg: string;
  activeText: string;
  badgeActive: string;
}[] = [
  {
    id: 'all',
    label: 'All Records',
    shortLabel: 'All',
    icon: LayoutGrid,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-600',
    activeText: 'text-white',
    badgeActive: 'bg-white/20 text-white',
  },
  {
    id: 'exam',
    label: 'Terminal Exams',
    shortLabel: 'Exams',
    icon: Award,
    iconColor: 'text-rose-600 dark:text-rose-400',
    activeBg: 'bg-rose-600',
    activeText: 'text-white',
    badgeActive: 'bg-white/20 text-white',
  },
  {
    id: 'ca',
    label: 'Continuous Assessment (CA)',
    shortLabel: 'CA',
    icon: BookOpen,
    iconColor: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-600',
    activeText: 'text-white',
    badgeActive: 'bg-white/20 text-white',
  },
  {
    id: 'assignment',
    label: 'Assignments',
    shortLabel: 'Assignments',
    icon: FileSpreadsheet,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-600',
    activeText: 'text-white',
    badgeActive: 'bg-white/20 text-white',
  },
  {
    id: 'quiz_test',
    label: 'Quizzes / Tests',
    shortLabel: 'Quizzes / Tests',
    icon: Sparkles,
    iconColor: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-600',
    activeText: 'text-white',
    badgeActive: 'bg-white/20 text-white',
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
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
  onAddNewRecord,
  onEditRecord,
  onDeleteRecord,
  onExportPDF,
  onExportCSV,
}: OfflineRecordsListProps) {
  const [activeTab, setActiveTab] = useState<OfflineCategoryTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
  ], [isTeacher]);

  // Category Counts for Tab Badges
  const categoryCounts = useMemo(() => {
    return {
      all: records.length,
      exam: records.filter(r => r.category === 'EXAM').length,
      ca: records.filter(r => r.category === 'CA').length,
      assignment: records.filter(r => r.category === 'ASSIGNMENT').length,
      quiz_test: records.filter(r => r.category === 'QUIZ' || r.category === 'MIDTERM').length,
    };
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Primary Category Tab filter
      if (activeTab === 'exam' && rec.category !== 'EXAM') return false;
      if (activeTab === 'ca' && rec.category !== 'CA') return false;
      if (activeTab === 'assignment' && rec.category !== 'ASSIGNMENT') return false;
      if (activeTab === 'quiz_test' && rec.category !== 'QUIZ' && rec.category !== 'MIDTERM') return false;

      // 2. Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = rec.assessmentType.toLowerCase().includes(q);
        const matchesSubject = rec.subject.toLowerCase().includes(q);
        const matchesClass = rec.className.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesClass) return false;
      }

      // 3. Class filter
      if (selectedClassId !== 'all' && rec.classId !== selectedClassId) {
        return false;
      }

      // 4. Secondary Category dropdown filter (if chosen while on 'all' or 'quiz_test')
      if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
        return false;
      }

      // 5. Status filter
      if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [records, activeTab, searchTerm, selectedClassId, selectedCategory, selectedStatus]);

  // Executive KPI calculations
  const totalRecordsCount = records.length;
  const totalMarksRecorded = records.reduce((acc, r) => acc + r.gradedStudents, 0);
  const publishedCount = records.filter(r => r.status === 'PUBLISHED').length;
  const draftCount = totalRecordsCount - publishedCount;

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 ${isTeacher ? 'bg-emerald-500/10 dark:bg-emerald-500/15' : 'bg-indigo-500/10 dark:bg-indigo-500/15'} rounded-full blur-3xl pointer-events-none`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`size-14 sm:size-16 rounded-2xl ${isTeacher ? 'bg-emerald-600 shadow-emerald-600/25' : 'bg-indigo-600 shadow-indigo-600/25'} text-white flex items-center justify-center shrink-0 shadow-lg`}>
              <FileSpreadsheet className="size-7 sm:size-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Offline Assessment Records
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Physical Marksheets
                </span>
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button type="button" className={`text-slate-400 ${isTeacher ? 'hover:text-emerald-600 dark:hover:text-emerald-400' : 'hover:text-indigo-600 dark:hover:text-indigo-400'} transition-colors`}>
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3 text-xs bg-slate-900 text-white rounded-xl shadow-xl">
                      Directory of all recorded physical classroom tests, continuous assessment marksheets, and offline exam papers. Click any record to view or edit scores.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
                Browse, filter, and manage all offline assessment marksheets. Click on any record to view or update scores, or add a new offline grade sheet.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2.5 shrink-0">
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
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Offline Records
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalRecordsCount}
            </p>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student Marks Recorded
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalMarksRecorded}
            </p>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Published Records
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {publishedCount}
            </p>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Drafts
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              {draftCount}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs: All, Exam, CA, Assignment, Quizzes / Test */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {categoryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = categoryCounts[tab.id];
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedCategory('all');
                }}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0
                  focus-visible:outline-none focus-visible:ring-2 ${isTeacher ? 'focus-visible:ring-emerald-500' : 'focus-visible:ring-indigo-500'}
                  ${isActive 
                    ? `${tab.activeBg} ${tab.activeText} shadow-md ${isTeacher ? 'shadow-emerald-600/20' : 'shadow-indigo-600/20'} dark:shadow-none` 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-white' : tab.iconColor} />
                <span>{tab.label}</span>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tabular-nums transition-colors
                    ${isActive 
                      ? tab.badgeActive 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search offline records by title, subject, or class name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-medium"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Class Filter (Hidden when viewing from within a single Class Details page) */}
            {!hideClassFilter && (
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="h-10 w-full sm:w-44 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all" className="text-xs font-semibold">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs font-semibold">
                      {c.name} {c.section ? `(${c.section})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Category Filter (Contextual to activeTab) */}
            {activeTab === 'all' ? (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10 w-full sm:w-36 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all" className="text-xs font-semibold">All Categories</SelectItem>
                  <SelectItem value="CA" className="text-xs font-semibold">CA</SelectItem>
                  <SelectItem value="QUIZ" className="text-xs font-semibold">Quiz</SelectItem>
                  <SelectItem value="MIDTERM" className="text-xs font-semibold">Mid-Term</SelectItem>
                  <SelectItem value="EXAM" className="text-xs font-semibold">Terminal Exam</SelectItem>
                  <SelectItem value="ASSIGNMENT" className="text-xs font-semibold">Assignment</SelectItem>
                </SelectContent>
              </Select>
            ) : activeTab === 'quiz_test' ? (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10 w-full sm:w-36 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="All Subtypes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="all" className="text-xs font-semibold">All Quizzes & Tests</SelectItem>
                  <SelectItem value="QUIZ" className="text-xs font-semibold">Quizzes only</SelectItem>
                  <SelectItem value="MIDTERM" className="text-xs font-semibold">Mid-Terms only</SelectItem>
                </SelectContent>
              </Select>
            ) : null}

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-10 w-full sm:w-32 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all" className="text-xs font-semibold">All Status</SelectItem>
                <SelectItem value="PUBLISHED" className="text-xs font-semibold">Published</SelectItem>
                <SelectItem value="DRAFT" className="text-xs font-semibold">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? `bg-white dark:bg-slate-700 shadow-sm ${isTeacher ? 'text-emerald-600' : 'text-indigo-600'} dark:text-white`
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? `bg-white dark:bg-slate-700 shadow-sm ${isTeacher ? 'text-emerald-600' : 'text-indigo-600'} dark:text-white`
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Table List"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRecords.map((rec) => {
            const catStyle = CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.CA;
            const percentage = rec.maxMarks > 0 ? Math.round((rec.averageScore / rec.maxMarks) * 100) : 0;

            return (
              <div
                key={rec.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md ${isTeacher ? 'hover:border-emerald-300 dark:hover:border-emerald-700' : 'hover:border-indigo-300 dark:hover:border-indigo-700'} transition-all flex flex-col justify-between group`}
              >
                <div>
                  {/* Card Header: Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                      {rec.category}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {rec.releaseDate && new Date(rec.releaseDate) > new Date() && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isTeacher ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80'}`} title={`Scheduled release: ${new Date(rec.releaseDate).toLocaleString()}`}>
                          <Clock size={10} />
                          {new Date(rec.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${rec.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {rec.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1">
                    {rec.assessmentType}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {rec.subject}
                    </span>
                    <span>•</span>
                    <span className="truncate">{rec.className}</span>
                  </div>

                  {/* Score & Graded Metrics Card */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Class Average:</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {rec.averageScore.toFixed(1)} / {rec.maxMarks} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} h-full rounded-full`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Graded: <strong>{rec.gradedStudents}</strong> students</span>
                      <span>Term: {rec.term}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onEditRecord(rec)}
                    className={`h-9 px-4 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-bold gap-1.5 shadow-sm`}
                  >
                    <Edit2 size={13} />
                    <span>View / Edit Scores</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                      <DropdownMenuItem onClick={() => onExportPDF(rec)} className="text-xs font-semibold cursor-pointer">
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExportCSV(rec)} className="text-xs font-semibold cursor-pointer">
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteRecord(rec.id)}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
                      >
                        Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Assessment Title</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4 text-center">Category</th>
                  <th className="py-3.5 px-4 text-center">Graded</th>
                  <th className="py-3.5 px-4 text-center">Average</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredRecords.map((rec) => {
                  const catStyle = CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.CA;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {rec.assessmentType}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {rec.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {rec.className}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                          {rec.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                        {rec.gradedStudents}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                        {rec.averageScore.toFixed(1)} / {rec.maxMarks}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${rec.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {rec.status}
                          </span>
                          {rec.releaseDate && new Date(rec.releaseDate) > new Date() && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold ${isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              <Clock size={9} />
                              {new Date(rec.releaseDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onEditRecord(rec)}
                            className={`h-8 px-3 text-xs font-bold ${isTeacher ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50' : 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'}`}
                          >
                            Edit Scores
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteRecord(rec.id)}
                            className="size-8 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
