"use client";

import React, { useRef, useMemo, useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  Sparkles,
  RotateCcw,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OfflineStudentGradeEntry } from '../types';
import { computeGradePill, getGradeEvaluation } from '@/utils/gradingSystem';

export { computeGradePill, getGradeEvaluation };

interface RosterSpreadsheetViewProps {
  roster: OfflineStudentGradeEntry[];
  maxMarks: number;
  gradingSystem?: any[];
  isTeacher?: boolean;
  onUpdateScore: (studentId: string, score: string | number) => void;
  onUpdateRemarks: (studentId: string, remarks: string) => void;
  onBatchFill: (scoreValue: number, remarks?: string) => void;
  onClearAll: () => void;
}

export default function RosterSpreadsheetView({
  roster,
  maxMarks,
  gradingSystem,
  isTeacher = false,
  onUpdateScore,
  onUpdateRemarks,
  onBatchFill,
  onClearAll,
}: RosterSpreadsheetViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const filteredRoster = useMemo(() => {
    if (!searchTerm.trim()) return roster;
    const q = searchTerm.toLowerCase();
    return roster.filter(s =>
      s.studentName.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q)
    );
  }, [roster, searchTerm]);

  // Handle keyboard navigation: Enter or ArrowDown focuses next, ArrowUp focuses prev
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number
  ) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextStudent = filteredRoster[currentIndex + 1];
      if (nextStudent) {
        inputRefs.current.get(nextStudent.studentId)?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevStudent = filteredRoster[currentIndex - 1];
      if (prevStudent) {
        inputRefs.current.get(prevStudent.studentId)?.focus();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden hidden md:block">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input
            placeholder="Search student by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-800 text-xs border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
            Quick Fill:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onBatchFill(maxMarks, 'Full Marks')}
            className="h-8 px-2.5 rounded-lg text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            All Max ({maxMarks})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onBatchFill(0, 'Absent')}
            className="h-8 px-2.5 rounded-lg text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            All Absent (0)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer gap-1"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4 min-w-[200px]">Student Name</th>
              <th className="py-3.5 px-4 w-60 min-w-[220px]">Student Code / ID</th>
              <th className="py-3.5 px-4 w-44">Score (/ {maxMarks})</th>
              <th className="py-3.5 px-4 w-20 text-center">%</th>
              <th className="py-3.5 px-4 w-20 text-center">Grade</th>
              <th className="py-3.5 px-4 min-w-[200px]">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredRoster.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredRoster.map((student, idx) => {
                const scoreNum = student.score === '' ? null : Number(student.score);
                const isOverMax = scoreNum !== null && scoreNum > maxMarks;
                const percentage = scoreNum !== null && maxMarks > 0 
                  ? Math.round((scoreNum / maxMarks) * 100) 
                  : null;
                const gradeInfo = percentage !== null ? computeGradePill(percentage, gradingSystem) : null;

                return (
                  <tr
                    key={student.studentId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-bold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'} border font-bold flex items-center justify-center shrink-0`}>
                          {student.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {student.studentName}
                          </p>
                          {student.departmentName && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              <span className={`size-1 rounded-full ${isTeacher ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                              {student.departmentName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Student Code */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xs tracking-wider inline-flex items-center min-w-[140px]">
                        {student.studentCode || 'N/A'}
                      </span>
                    </td>

                    {/* Score Input */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Input
                          ref={(el) => {
                            if (el) inputRefs.current.set(student.studentId, el);
                            else inputRefs.current.delete(student.studentId);
                          }}
                          type="number"
                          step="0.5"
                          min={0}
                          max={maxMarks}
                          placeholder="—"
                          value={student.score}
                          onChange={(e) => onUpdateScore(student.studentId, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          className={`h-9 font-bold text-sm tabular-nums rounded-lg bg-white dark:bg-slate-800 transition-all ${
                            isOverMax
                              ? 'border-rose-500 text-rose-600 focus-visible:ring-rose-500'
                              : student.score !== ''
                              ? (isTeacher ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-indigo-500 text-indigo-700 dark:text-indigo-300')
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        <span className="text-slate-400 font-medium shrink-0">
                          / {maxMarks}
                        </span>
                      </div>
                      {isOverMax && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                          Exceeds max ({maxMarks})
                        </p>
                      )}
                    </td>

                    {/* Percentage */}
                    <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {percentage !== null ? `${percentage}%` : '—'}
                    </td>

                    {/* Letter Grade */}
                    <td className="py-3 px-4 text-center">
                      {gradeInfo ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black border ${gradeInfo.bg}`}>
                          {gradeInfo.label}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <Input
                        placeholder="e.g. Good performance"
                        value={student.remarks || ''}
                        onChange={(e) => onUpdateRemarks(student.studentId, e.target.value)}
                        className="h-9 text-xs rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 placeholder:text-slate-400"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono">↓</kbd> to move to the next student.</span>
        <span>{filteredRoster.length} students loaded</span>
      </div>
    </div>
  );
}
