"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OfflineStudentGradeEntry } from '../types';

interface OfflineGradesCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameLabel?: string;
  subject: string;
  category: string;
  maxMarks: number;
  roster: OfflineStudentGradeEntry[];
  isTeacher?: boolean;
  onImportScores: (scoresMap: Record<string, { score: number; remarks?: string }>) => void;
}

export default function OfflineGradesCSVModal({
  isOpen,
  onClose,
  classNameLabel,
  subject,
  category,
  maxMarks,
  roster,
  isTeacher = false,
  onImportScores,
}: OfflineGradesCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{ matchedCount: number; errors: string[] } | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, { score: number; remarks?: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Download pre-filled template
  const handleDownloadTemplate = () => {
    const headers = ['Student ID (Do not edit)', 'Student Name', 'Student Code', `Score (Max: ${maxMarks})`, 'Remarks'];
    const rows = roster.map((s) => [
      `"${s.studentId}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${(s.studentCode || '').replace(/"/g, '""')}"`,
      s.score !== '' ? s.score : '',
      `"${(s.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OfflineGrades_${(classNameLabel || 'Class').replace(/\s+/g, '_')}_${subject}_${category}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parse CSV on upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setParsedPreview({ matchedCount: 0, errors: ['CSV file is empty or missing data rows.'] });
        return;
      }

      const errors: string[] = [];
      const scoreMap: Record<string, { score: number; remarks?: string }> = {};
      let matches = 0;

      // Skip header line (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Basic CSV column split respecting quotes
        const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());

        const studentId = cleanCols[0];
        const studentName = cleanCols[1];
        const scoreRaw = cleanCols[3];
        const remarks = cleanCols[4] || '';

        // Match by studentId first, then by name
        const matchedStudent = roster.find(s => s.studentId === studentId) ||
          roster.find(s => s.studentName.toLowerCase() === (studentName || '').toLowerCase());

        if (matchedStudent) {
          const scoreNum = parseFloat(scoreRaw);
          if (!isNaN(scoreNum)) {
            if (scoreNum > maxMarks) {
              errors.push(`Row ${i + 1}: Score ${scoreNum} for ${matchedStudent.studentName} exceeds max marks (${maxMarks}).`);
            } else if (scoreNum < 0) {
              errors.push(`Row ${i + 1}: Score ${scoreNum} cannot be negative.`);
            } else {
              scoreMap[matchedStudent.studentId] = { score: scoreNum, remarks };
              matches++;
            }
          }
        }
      }

      setParsedData(scoreMap);
      setParsedPreview({ matchedCount: matches, errors });
    };
    reader.readAsText(selected);
  };

  const handleApply = () => {
    if (Object.keys(parsedData).length > 0) {
      onImportScores(parsedData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-full max-w-2xl rounded-2xl dark:bg-slate-900 dark:border-slate-800 p-6">
        <DialogHeader>
          <div className={`size-10 rounded-xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'} flex items-center justify-center mb-2`}>
            <FileSpreadsheet size={20} />
          </div>
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
            Batch Import Grades via CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Download the pre-filled student roster template, enter the marks in Excel or Google Sheets, and re-upload here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Step 1: Download Template */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Step 1: Download Class Roster
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Contains all {roster.length} students currently in this class.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="h-9 px-3 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              Download CSV
            </Button>
          </div>

          {/* Step 2: Upload CSV */}
          <div className={`p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 ${isTeacher ? 'hover:border-emerald-400 dark:hover:border-emerald-600' : 'hover:border-indigo-400 dark:hover:border-indigo-600'} transition-colors text-center`}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload size={24} className="text-slate-400" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Step 2: Upload your completed CSV
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-4 rounded-lg text-xs font-bold cursor-pointer"
              >
                Browse CSV File
              </Button>
              {file && (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Preview & Errors */}
          {parsedPreview && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Found valid scores for <strong>{parsedPreview.matchedCount}</strong> students.</span>
              </div>

              {parsedPreview.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 space-y-1 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} className="text-rose-500" />
                    <span>Errors found in CSV:</span>
                  </div>
                  {parsedPreview.errors.map((err, idx) => (
                    <p key={idx} className="pl-5">• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!parsedPreview || parsedPreview.matchedCount === 0}
            onClick={handleApply}
            className={`rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-bold shadow-md`}
          >
            Apply {parsedPreview?.matchedCount || 0} Scores to Roster
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
