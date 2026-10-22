"use client";

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Camera,
  Layers,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  Info,
  ChevronDown,
  Sparkles,
  RotateCcw,
  Loader2,
  Building2
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
import { OfflineAssessmentCategory, OfflineGradesBatchConfig } from '../types';

interface OfflineGradesHeaderProps {
  config: OfflineGradesBatchConfig;
  onChangeConfig: (updates: Partial<OfflineGradesBatchConfig>) => void;
  classes: any[];
  departments?: { id: string; name: string; code?: string }[];
  subjects: string[];
  sessions: any[];
  isTeacher?: boolean;
  isLoadingRoster: boolean;
  isLoadingSubjects?: boolean;
  isSaving: boolean;
  onSave: (status: 'DRAFT' | 'PUBLISHED') => void;
  onOpenCSVModal: () => void;
  onOpenOCRModal: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onResetScores: () => void;
}

const CATEGORY_OPTIONS: { value: OfflineAssessmentCategory; label: string; badge: string }[] = [
  { value: 'CA', label: 'Continuous Assessment (CA)', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { value: 'QUIZ', label: 'Quiz / Class Test', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  { value: 'MIDTERM', label: 'Mid-Term Test', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  { value: 'ASSIGNMENT', label: 'Physical Assignment', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { value: 'EXAM', label: 'Terminal / Final Exam', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
];

export default function OfflineGradesHeader({
  config,
  onChangeConfig,
  classes,
  departments = [],
  subjects,
  sessions,
  isTeacher = false,
  isLoadingRoster,
  isLoadingSubjects,
  isSaving,
  onSave,
  onOpenCSVModal,
  onOpenOCRModal,
  onExportPDF,
  onExportCSV,
  onResetScores,
}: OfflineGradesHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 ${isTeacher ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : 'bg-indigo-500/5 dark:bg-indigo-500/10'} rounded-full blur-3xl pointer-events-none`} />

      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`size-12 sm:size-14 rounded-2xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'} border flex items-center justify-center shrink-0 shadow-sm`}>
            <FileSpreadsheet className="size-6 sm:size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Offline Grades & Assessment Pad
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Physical Records
              </span>
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button type="button" className={`text-slate-400 ${isTeacher ? 'hover:text-emerald-600 dark:hover:text-emerald-400' : 'hover:text-indigo-600 dark:hover:text-indigo-400'} transition-colors`}>
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-md p-3.5 text-xs leading-relaxed bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl rounded-xl">
                    <p className="font-bold text-white mb-1">About Offline Grades:</p>
                    <p>
                      Record, manage, and batch-upload offline classroom assessments, Continuous Assessment (CA) scores, physical homework, and paper exam marks.
                    </p>
                    <p className="mt-1 text-slate-300">
                      Saved grades directly integrate with class term calculations, student report cards, and parent dashboards without requiring computer-based test (CBT) attempts.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Select class, department, subject, and assessment category to populate the score roster.
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCSVModal}
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 font-bold text-xs gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Upload size={14} className={isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} />
            <span className="hidden sm:inline">Import</span> CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenOCRModal}
            className={`h-10 px-3.5 rounded-xl ${isTeacher ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' : 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'} font-bold text-xs gap-1.5 cursor-pointer`}
          >
            <Camera size={14} />
            <span className="hidden sm:inline">AI Sheet</span> Scan
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 font-bold text-xs gap-1.5 cursor-pointer"
              >
                <Download size={14} className="text-slate-600 dark:text-slate-300" />
                Export
                <ChevronDown size={12} className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[70] w-44 rounded-xl dark:bg-slate-800 dark:border-slate-700">
              <DropdownMenuItem onClick={onExportPDF} className="text-xs font-semibold gap-2 cursor-pointer">
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportCSV} className="text-xs font-semibold gap-2 cursor-pointer">
                Export to CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

          <Button
            type="button"
            disabled={isSaving || !config.classId || !config.subject}
            onClick={() => onSave('DRAFT')}
            variant="outline"
            className="h-10 px-4 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            Save Draft
          </Button>

          <Button
            type="button"
            disabled={isSaving || !config.classId || !config.subject}
            onClick={() => onSave('PUBLISHED')}
            className={`h-10 px-5 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold text-xs gap-1.5 shadow-md dark:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CheckCircle2 size={14} />
            {isSaving ? 'Saving...' : 'Publish Grades'}
          </Button>
        </div>
      </div>

      {/* Context Selection Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 pt-5">
        {/* 1. Class Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} /> Target Class Cohort
          </label>
          <Select
            value={config.classId || undefined}
            onValueChange={(val) => {
              const selected = classes.find(c => c.id === val);
              onChangeConfig({ 
                classId: val, 
                className: selected?.name ? `${selected.name} ${selected.section || ''}`.trim() : undefined,
                departmentId: 'ALL',
                departmentName: undefined,
                subject: ''
              });
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
              <SelectValue placeholder="Select Class Cohort" />
            </SelectTrigger>
            <SelectContent className="z-[70] max-h-60 rounded-xl dark:bg-slate-800 dark:border-slate-700">
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id} className="text-xs font-semibold cursor-pointer">
                  {cls.name} {cls.section ? `(${cls.section})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Target Department Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Building2 size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} /> Target Department
          </label>
          {!config.classId ? (
            <div className="h-11 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex items-center px-3.5 text-xs text-slate-400 font-medium">
              Select class first
            </div>
          ) : (
            <Select
              value={config.departmentId || 'ALL'}
              onValueChange={(val) => {
                const deptObj = departments.find(d => d.id === val);
                onChangeConfig({ 
                  departmentId: val,
                  departmentName: val === 'ALL' ? undefined : (deptObj?.name || undefined)
                });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                <SelectValue placeholder="All Departments / Direct" />
              </SelectTrigger>
              <SelectContent className="z-[70] max-h-60 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="ALL" className="text-xs font-semibold cursor-pointer">
                  All Departments / Direct
                </SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id} className="text-xs font-semibold cursor-pointer">
                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 3. Subject Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} /> Subject Curriculum
          </label>
          {!config.classId ? (
            <div className="h-11 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex items-center px-3.5 text-xs text-slate-400 font-medium">
              Select class cohort first
            </div>
          ) : (isLoadingSubjects || isLoadingRoster) ? (
            <div className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between px-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold animate-pulse">
              <span className="flex items-center gap-2">
                <Loader2 className={`w-4 h-4 animate-spin ${isTeacher ? 'text-emerald-500' : 'text-indigo-500'} shrink-0`} />
                <span>Loading class subjects...</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fetching</span>
            </div>
          ) : subjects && subjects.length > 0 ? (
            <Select
              value={config.subject || undefined}
              onValueChange={(val) => onChangeConfig({ subject: val })}
            >
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent className="z-[70] max-h-60 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                {subjects.map((sub, idx) => (
                  <SelectItem key={idx} value={sub} className="text-xs font-semibold cursor-pointer">
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : isTeacher ? (
            <div className="h-11 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center px-3.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
              No assigned subjects for this class
            </div>
          ) : (
            <Input
              placeholder="e.g. Mathematics"
              value={config.subject}
              onChange={(e) => onChangeConfig({ subject: e.target.value.slice(0, 100) })}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          )}
        </div>

        {/* 3. Assessment Category */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} /> Assessment Category
          </label>
          <Select
            value={config.category}
            onValueChange={(val: OfflineAssessmentCategory) => {
              const defaultMax = val === 'CA' ? 20 : (val === 'QUIZ' ? 10 : (val === 'MIDTERM' ? 40 : 100));
              const prevDefaultTitles = ['Continuous Assessment 1', 'CA 1', 'Quiz 1', 'Mid-Term Test', 'Physical Assignment 1', 'Terminal Exam 1', `${config.category} 1`, `${config.category} Assessment`];
              const isDefaultTitle = !config.assessmentType || prevDefaultTitles.includes(config.assessmentType);
              const newDefaultTitle = 
                val === 'EXAM' ? 'Terminal Exam 1' :
                val === 'ASSIGNMENT' ? 'Physical Assignment 1' :
                val === 'QUIZ' ? 'Quiz 1' :
                val === 'MIDTERM' ? 'Mid-Term Test' :
                'Continuous Assessment 1';

              onChangeConfig({ 
                category: val,
                maxMarks: defaultMax,
                assessmentType: isDefaultTitle ? newDefaultTitle : config.assessmentType
              });
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl dark:bg-slate-800 dark:border-slate-700">
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-xs font-semibold cursor-pointer">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Assessment Title / Label */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assessment Name / Label
          </label>
          <Input
            placeholder="e.g. CA 1 - Algebra Test"
            value={config.assessmentType}
            maxLength={100}
            onChange={(e) => onChangeConfig({ assessmentType: e.target.value.slice(0, 100) })}
            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Secondary Row: Max Marks, Weight, Session, Term, Release Date */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/60">
        {/* Max Marks */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Max Score Marks
          </label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={config.maxMarks || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 1000) {
                onChangeConfig({ maxMarks: val || 100 });
              }
            }}
            className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Weight Multiplier
          </label>
          <Input
            type="number"
            step="0.1"
            min={0.1}
            max={10}
            value={config.weight || 1.0}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 10) {
                onChangeConfig({ weight: val || 1.0 });
              }
            }}
            className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        {/* Academic Session */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar size={11} /> Academic Session
          </label>
          <Select
            value={config.sessionId || undefined}
            onValueChange={(val) => {
              const selected = sessions.find(s => s.id === val);
              let derivedTerm = config.term;
              if (selected?.currentTerm || selected?.term) {
                const raw = selected.currentTerm || selected.term;
                const t = String(raw).toUpperCase().trim();
                if (t.includes('SECOND') || t === '2') derivedTerm = 'SECOND';
                else if (t.includes('THIRD') || t === '3') derivedTerm = 'THIRD';
                else derivedTerm = 'FIRST';
              }
              onChangeConfig({ 
                sessionId: val, 
                sessionName: selected?.name || undefined,
                term: derivedTerm 
              });
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
              <SelectValue placeholder="Select Session" />
            </SelectTrigger>
            <SelectContent className="z-[70] max-h-60 rounded-xl dark:bg-slate-800 dark:border-slate-700">
              {sessions.map((sess) => (
                <SelectItem key={sess.id} value={sess.id} className="text-xs font-semibold cursor-pointer">
                  {sess.name} {sess.isCurrent || sess.isActive || sess.status === 'ACTIVE' ? '(Current)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Term */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Term / Semester
          </label>
          <Select
            value={config.term}
            onValueChange={(val: 'FIRST' | 'SECOND' | 'THIRD') => onChangeConfig({ term: val })}
          >
            <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="FIRST" className="text-xs font-semibold cursor-pointer">First Term</SelectItem>
              <SelectItem value="SECOND" className="text-xs font-semibold cursor-pointer">Second Term</SelectItem>
              <SelectItem value="THIRD" className="text-xs font-semibold cursor-pointer">Third Term</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Release Date (Optional) */}
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar size={11} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} /> Release Date (Optional)
          </label>
          <Input
            type="datetime-local"
            value={config.releaseDate || ''}
            onChange={(e) => onChangeConfig({ releaseDate: e.target.value })}
            className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
