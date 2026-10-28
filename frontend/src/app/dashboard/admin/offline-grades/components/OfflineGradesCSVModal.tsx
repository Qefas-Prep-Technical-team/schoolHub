"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
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
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{ matchedCount: number; errors: string[] } | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, { score: number; remarks?: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Download Excel (.xlsx) template
  const handleDownloadExcelTemplate = () => {
    const headers = ['Student Name', 'Student Code / Reg No', `Score (Max: ${maxMarks})`, 'Remarks'];
    const rows = roster.map((s) => [
      s.studentName,
      s.studentCode || s.studentId,
      s.score !== '' ? Number(s.score) : '',
      s.remarks || '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [
      { wch: 30 }, // Student Name
      { wch: 22 }, // Student Code / Reg No
      { wch: 18 }, // Score
      { wch: 30 }, // Remarks
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grade Sheet');
    const safeClass = (classNameLabel || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSubject = (subject || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `Grade_Sheet_${safeClass}_${safeSubject}_${category}.xlsx`);
  };

  // 2. Download CSV (.csv) template
  const handleDownloadCSVTemplate = () => {
    const headers = ['Student Name', 'Student Code / Reg No', `Score (Max: ${maxMarks})`, 'Remarks'];
    const rows = roster.map((s) => [
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${(s.studentCode || s.studentId).replace(/"/g, '""')}"`,
      s.score !== '' ? s.score : '',
      `"${(s.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeClass = (classNameLabel || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSubject = (subject || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Grade_Sheet_${safeClass}_${safeSubject}_${category}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Process spreadsheet (Excel or CSV)
  const processSpreadsheet = useCallback((selected: File) => {
    setFile(selected);
    setIsParsing(true);
    const reader = new FileReader();
    const isBinary = selected.name.match(/\.(xlsx|xls)$/i);

    const parseRows = (rows: unknown[][]) => {
      if (rows.length < 2) {
        setParsedPreview({ matchedCount: 0, errors: ['Spreadsheet file is empty or missing data rows.'] });
        setIsParsing(false);
        return;
      }

      // Find header row
      let headerRowIndex = 0;
      for (let r = 0; r < Math.min(6, rows.length); r++) {
        const rowStr = (rows[r] || []).map(cell => String(cell || '').toLowerCase()).join(' ');
        if (rowStr.includes('student') || rowStr.includes('score') || rowStr.includes('name') || rowStr.includes('code')) {
          headerRowIndex = r;
          break;
        }
      }

      const headerRow = rows[headerRowIndex] || [];
      let codeColIdx = -1;
      let idColIdx = -1;
      let nameColIdx = -1;
      let scoreColIdx = -1;
      let remarksColIdx = -1;

      headerRow.forEach((col, idx) => {
        const str = String(col || '').toLowerCase().trim();
        if (str.includes('code') || str.includes('reg') || str.includes('admission') || str.includes('matric')) {
          codeColIdx = idx;
        } else if (str.includes('id') && !str.includes('name')) {
          idColIdx = idx;
        } else if (str.includes('name') || str.includes('student')) {
          nameColIdx = idx;
        } else if (str.includes('score') || str.includes('mark') || str.includes('grade')) {
          scoreColIdx = idx;
        } else if (str.includes('remark') || str.includes('comment')) {
          remarksColIdx = idx;
        }
      });

      // Default column positions if headers aren't explicitly matched
      if (nameColIdx === -1) nameColIdx = 0;
      if (codeColIdx === -1 && idColIdx === -1) codeColIdx = 1;
      if (scoreColIdx === -1) scoreColIdx = 2;
      if (remarksColIdx === -1) remarksColIdx = 3;

      const errors: string[] = [];
      const scoreMap: Record<string, { score: number; remarks?: string }> = {};
      let matches = 0;

      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const codeVal = codeColIdx !== -1 ? String(row[codeColIdx] ?? '').trim() : '';
        const idVal = idColIdx !== -1 ? String(row[idColIdx] ?? '').trim() : '';
        const nameVal = nameColIdx !== -1 ? String(row[nameColIdx] ?? '').trim() : '';
        const scoreRaw = scoreColIdx !== -1 ? row[scoreColIdx] : undefined;
        const remarks = remarksColIdx !== -1 ? String(row[remarksColIdx] ?? '').trim() : '';

        if (!codeVal && !idVal && !nameVal) continue;

        // Match priority: 1. Student Code, 2. Database ID, 3. Student Name
        const matchedStudent = 
          (codeVal ? roster.find(s => s.studentCode && s.studentCode.toLowerCase().trim() === codeVal.toLowerCase()) : null) ||
          (idVal ? roster.find(s => s.studentId && s.studentId.trim() === idVal) : null) ||
          (nameVal ? roster.find(s => s.studentName.toLowerCase().trim() === nameVal.toLowerCase()) : null);

        if (matchedStudent) {
          if (scoreRaw !== undefined && scoreRaw !== null && scoreRaw !== '') {
            const scoreNum = parseFloat(String(scoreRaw));
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
      }

      setParsedData(scoreMap);
      setParsedPreview({ matchedCount: matches, errors });
      setIsParsing(false);
    };

    if (isBinary) {
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
          parseRows(rows);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Invalid spreadsheet format';
          setParsedPreview({ matchedCount: 0, errors: [`Failed to parse Excel file: ${message}`] });
          setIsParsing(false);
        }
      };
      reader.readAsBinaryString(selected);
    } else {
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const workbook = XLSX.read(text, { type: 'string' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
          parseRows(rows);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Invalid spreadsheet format';
          setParsedPreview({ matchedCount: 0, errors: [`Failed to parse CSV file: ${message}`] });
          setIsParsing(false);
        }
      };
      reader.readAsText(selected);
    }
  }, [roster, maxMarks]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processSpreadsheet(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSpreadsheet(files[0]);
    }
  };

  const handleApply = () => {
    if (Object.keys(parsedData).length > 0) {
      onImportScores(parsedData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-full max-w-2xl rounded-2xl dark:bg-slate-900 dark:border-slate-800 p-5 sm:p-6">
        <DialogHeader>
          <div className={`size-11 rounded-2xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60'} flex items-center justify-center mb-2 shadow-xs`}>
            <FileSpreadsheet size={22} />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Batch Import Grades (Excel / CSV)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Download the official pre-filled student roster template, enter marks offline in Excel, Google Sheets, or WPS Office, and upload or drag-and-drop the saved file here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Step 1: Download Template */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className={`size-4 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[9px] font-black flex items-center justify-center`}>
                  1
                </span>
                Step 1: Download Class Roster Template
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pre-populated with all {roster.length} students currently in this class cohort.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadExcelTemplate}
                className="h-9 px-3 rounded-xl border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold gap-1.5 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-xs"
              >
                <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadCSVTemplate}
                className="h-9 px-3 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
              >
                <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                <span>CSV (.csv)</span>
              </Button>
            </div>
          </div>

          {/* Step 2: Upload Excel / CSV */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-5 rounded-xl border-2 border-dashed transition-all text-center ${
              isDragging
                ? isTeacher
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {isParsing ? (
              <div className="flex flex-col items-center justify-center gap-2 py-3">
                <Loader2 size={24} className={`animate-spin ${isTeacher ? 'text-emerald-600' : 'text-indigo-600'}`} />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Parsing spreadsheet scores...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className={`size-10 rounded-xl ${isTeacher ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'} flex items-center justify-center`}>
                  <Upload size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                    <span className={`size-4 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[9px] font-black flex items-center justify-center`}>
                      2
                    </span>
                    Step 2: Upload or Drop Your Completed Spreadsheet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Supports Microsoft Excel (.xlsx, .xls), Google Sheets export, and CSV files
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-4 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Browse Excel / CSV File
                  </Button>
                  <span className="text-[11px] text-slate-400">or drag-and-drop here</span>
                </div>
                {file && (
                  <p className={`text-[11px] ${isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} font-semibold mt-1`}>
                    Selected File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Preview & Errors */}
          {parsedPreview && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Found valid scores for <strong>{parsedPreview.matchedCount}</strong> out of {roster.length} students.</span>
              </div>

              {parsedPreview.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 space-y-1 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} className="text-rose-500" />
                    <span>Errors / Warnings found in spreadsheet:</span>
                  </div>
                  {parsedPreview.errors.map((err, idx) => (
                    <p key={idx} className="pl-5">• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
            className={`rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50`}
          >
            Apply {parsedPreview?.matchedCount || 0} Scores to Marksheet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
