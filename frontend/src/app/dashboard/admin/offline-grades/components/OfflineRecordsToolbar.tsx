"use client";

import React from 'react';
import {
  FileSpreadsheet,
  Award,
  BookOpen,
  Sparkles,
  Search,
  LayoutGrid,
  List,
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
import { OfflineCategoryTab } from './OfflineRecordsList';

interface OfflineRecordsToolbarProps {
  activeTab: OfflineCategoryTab;
  setActiveTab: (tab: OfflineCategoryTab) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  classes: any[];
  hideClassFilter?: boolean;
  isTeacher?: boolean;
  categoryTabs: {
    id: OfflineCategoryTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    iconColor: string;
    activeBg: string;
    activeText: string;
    badgeActive: string;
  }[];
  categoryCounts: Record<string, number>;
}

export default function OfflineRecordsToolbar({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedClassId,
  setSelectedClassId,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedDateRange,
  setSelectedDateRange,
  viewMode,
  setViewMode,
  classes,
  hideClassFilter = false,
  isTeacher = false,
  categoryTabs,
  categoryCounts,
}: OfflineRecordsToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Category Tabs: All, Exam, CA, Assignment, Quizzes / Test */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {categoryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = categoryCounts[tab.id] || 0;
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
            {/* Class Filter */}
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

            {/* Category Filter */}
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

            {/* Date Range Filter */}
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="h-10 w-full sm:w-36 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all" className="text-xs font-semibold">All Time</SelectItem>
                <SelectItem value="today" className="text-xs font-semibold">Recorded Today</SelectItem>
                <SelectItem value="this_week" className="text-xs font-semibold">This Week</SelectItem>
                <SelectItem value="this_month" className="text-xs font-semibold">This Month</SelectItem>
                <SelectItem value="this_term" className="text-xs font-semibold">This Term</SelectItem>
              </SelectContent>
            </Select>

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
    </div>
  );
}
