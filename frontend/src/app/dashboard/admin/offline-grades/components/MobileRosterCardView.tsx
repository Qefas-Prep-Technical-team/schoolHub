"use client";

import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OfflineStudentGradeEntry } from '../types';
import { computeGradePill } from './RosterSpreadsheetView';

interface MobileRosterCardViewProps {
  roster: OfflineStudentGradeEntry[];
  maxMarks: number;
  gradingSystem?: any[];
  isTeacher?: boolean;
  onUpdateScore: (studentId: string, score: string | number) => void;
  onUpdateRemarks: (studentId: string, remarks: string) => void;
  isSaving: boolean;
  onSave: (status: 'DRAFT' | 'PUBLISHED') => void;
}

export default function MobileRosterCardView({
  roster,
  maxMarks,
  gradingSystem,
  isTeacher = false,
  onUpdateScore,
  onUpdateRemarks,
  isSaving,
  onSave,
}: MobileRosterCardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRemarks, setExpandedRemarks] = useState<Record<string, boolean>>({});

  const filteredRoster = roster.filter(s =>
    !searchTerm.trim() ||
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradedCount = roster.filter(s => s.score !== '').length;
  const progressPercent = roster.length > 0 ? Math.round((gradedCount / roster.length) * 100) : 0;

  const toggleRemarks = (id: string) => {
    setExpandedRemarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="block md:hidden pb-24">
      {/* Mobile Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <Input
          placeholder="Search student name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-medium"
        />
      </div>

      {/* Student Cards List */}
      <div className="space-y-3">
        {filteredRoster.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-400 font-medium">No students found.</p>
          </div>
        ) : (
          filteredRoster.map((student, idx) => {
            const scoreNum = student.score === '' ? null : Number(student.score);
            const isOverMax = scoreNum !== null && scoreNum > maxMarks;
            const percentage = scoreNum !== null && maxMarks > 0 
              ? Math.round((scoreNum / maxMarks) * 100) 
              : null;
            const gradeInfo = percentage !== null ? computeGradePill(percentage, gradingSystem) : null;
            const hasRemarks = Boolean(student.remarks);
            const isRemarksOpen = expandedRemarks[student.studentId] || hasRemarks;

            return (
              <div
                key={student.studentId}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm"
              >
                {/* Header Row: Index, Code, Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center tabular-nums">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 tracking-wider">
                      {student.studentCode || 'N/A'}
                    </span>
                  </div>

                  {student.score !== '' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Graded
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">
                      Pending
                    </span>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex items-center gap-3 mb-3.5">
                  <div className={`size-10 rounded-full ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'} border font-bold text-base flex items-center justify-center shrink-0`}>
                    {student.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {student.studentName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {student.departmentName ? `${student.departmentName} Department` : 'Direct Cohort Student'}
                    </p>
                  </div>
                </div>

                {/* Score Input Row */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      step="0.5"
                      min={0}
                      max={maxMarks}
                      inputMode="decimal"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={student.score}
                      onChange={(e) => onUpdateScore(student.studentId, e.target.value)}
                      className={`h-11 font-black text-base tabular-nums rounded-xl bg-white dark:bg-slate-900 transition-all ${
                        isOverMax
                          ? 'border-rose-500 text-rose-600'
                          : student.score !== ''
                          ? (isTeacher ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-indigo-500 text-indigo-700 dark:text-indigo-300')
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-400 shrink-0">
                      / {maxMarks}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {percentage !== null && (
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {percentage}%
                      </span>
                    )}

                    {gradeInfo && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${gradeInfo.bg}`}>
                        {gradeInfo.label}
                      </span>
                    )}
                  </div>
                </div>

                {isOverMax && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5 px-1">
                    Score exceeds maximum marks of {maxMarks}
                  </p>
                )}

                {/* Quick Fill Actions per Card */}
                <div className="flex items-center justify-between mt-3 pt-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateScore(student.studentId, maxMarks)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      Max ({maxMarks})
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateScore(student.studentId, 0)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      0 / Absent
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRemarks(student.studentId)}
                    className={`flex items-center gap-1 font-bold ${isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} hover:underline`}
                  >
                    <MessageSquare size={12} />
                    {hasRemarks ? 'Edit Remarks' : '+ Remark'}
                  </button>
                </div>

                {/* Remarks Field (if opened) */}
                {isRemarksOpen && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Input
                      placeholder="Add remarks for student (e.g. Needs extra practice)..."
                      value={student.remarks || ''}
                      onChange={(e) => onUpdateRemarks(student.studentId, e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 p-3 sm:hidden shadow-lg">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
          <span>{gradedCount} of {roster.length} Graded</span>
          <span className={isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className={`${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} h-full rounded-full transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            disabled={isSaving || roster.length === 0}
            onClick={() => onSave('DRAFT')}
            variant="outline"
            className="h-11 rounded-xl font-bold text-xs border-slate-300 dark:border-slate-700"
          >
            <Save size={14} className="mr-1" />
            Save Draft
          </Button>
          <Button
            type="button"
            disabled={isSaving || roster.length === 0}
            onClick={() => onSave('PUBLISHED')}
            className={`h-11 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold text-xs shadow-md`}
          >
            <CheckCircle2 size={14} className="mr-1" />
            {isSaving ? 'Saving...' : 'Publish All'}
          </Button>
        </div>
      </div>
    </div>
  );
}
