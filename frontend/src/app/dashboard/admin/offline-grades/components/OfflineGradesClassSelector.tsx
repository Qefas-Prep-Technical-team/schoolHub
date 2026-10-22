"use client";

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Users,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Info,
  Calendar,
  History
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface OfflineGradesClassSelectorProps {
  classes: any[];
  isLoading: boolean;
  onSelectClass: (classId: string, className: string, defaultSubject?: string) => void;
  onOpenHistory: () => void;
  totalBatchesCount: number;
}

export default function OfflineGradesClassSelector({
  classes,
  isLoading,
  onSelectClass,
  onOpenHistory,
  totalBatchesCount,
}: OfflineGradesClassSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter classes by search query
  const filteredClasses = useMemo(() => {
    if (!searchTerm.trim()) return classes;
    const q = searchTerm.toLowerCase();
    return classes.filter((cls) => {
      const name = (cls.name || '').toLowerCase();
      const section = (cls.section || '').toLowerCase();
      const code = (cls.classCode || '').toLowerCase();
      return name.includes(q) || section.includes(q) || code.includes(q);
    });
  }, [classes, searchTerm]);

  // Aggregate stats
  const totalStudents = useMemo(() => {
    return classes.reduce((acc, c) => acc + (c._count?.enrollments ?? c.enrollments?.length ?? 0), 0);
  }, [classes]);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="size-14 sm:size-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/25">
              <FileSpreadsheet className="size-7 sm:size-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Offline Grades & Assessment Pad
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  <Sparkles size={12} className="text-indigo-500" />
                  Physical Marksheets
                </span>
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Info size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3 text-xs bg-slate-900 text-white rounded-xl shadow-xl">
                      Select a class cohort to record continuous assessment scores (CA), physical tests, homework, and terminal exam marks.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
                Choose a class below to launch its interactive score roster. Enter marks student-by-student with keyboard navigation, upload from CSV, or scan paper grade sheets.
              </p>
            </div>
          </div>

          {/* Quick Action Button to History */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onOpenHistory}
              className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 font-bold text-xs gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
            >
              <History size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>Recorded Batches ({totalBatchesCount})</span>
            </Button>
          </div>
        </div>

        {/* Aggregate KPI Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Classes Available</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {classes.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {totalStudents} students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assessment Types</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                CA • Tests • Exams • Homework
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Search & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search classes by name, section, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-medium"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-bold text-slate-400">
            {filteredClasses.length} of {classes.length} classes
          </span>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Class List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
          <Layers size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Classes Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? `No classes match "${searchTerm}". Try a different search term.` : 'No classes registered in this school yet.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredClasses.map((cls) => {
            const studentCount = cls._count?.enrollments ?? cls.enrollments?.length ?? 0;
            const subjectsCount = cls.subjects?.length || 0;
            const defaultSubject = cls.subjects?.[0]?.name || cls.subjects?.[0] || 'General';
            const displayName = `${cls.name} ${cls.section ? `(${cls.section})` : ''}`.trim();

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls.id, displayName, defaultSubject)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-lg border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {cls.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {cls.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {cls.section && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                              Section {cls.section}
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-slate-400">
                            {cls.classCode || 'NO CODE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attributes Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Users size={14} className="text-slate-400 shrink-0" />
                      <span className="font-bold tabular-nums">{studentCount} Students</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <BookOpen size={14} className="text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{subjectsCount} Subjects</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-2">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-between group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <span>Enter Offline Grades</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredClasses.map((cls) => {
              const studentCount = cls._count?.enrollments ?? cls.enrollments?.length ?? 0;
              const subjectsCount = cls.subjects?.length || 0;
              const defaultSubject = cls.subjects?.[0]?.name || cls.subjects?.[0] || 'General';
              const displayName = `${cls.name} ${cls.section ? `(${cls.section})` : ''}`.trim();

              return (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id, displayName, defaultSubject)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-base flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {cls.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {cls.name}
                        </h3>
                        {cls.section && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {cls.section}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Code: {cls.classCode || 'N/A'} • {studentCount} Students • {subjectsCount} Subjects
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Record Grades
                    </span>
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
