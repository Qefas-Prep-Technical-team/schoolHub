"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FileSpreadsheet,
  Upload,
  ChevronDown,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Loader2,
  FileText,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { OfflineAssessmentCategory } from '../types';

interface ClassItem {
  id: string;
  name: string;
  section?: string;
  [key: string]: unknown;
}

interface TeacherSubjectItem {
  id: string;
  name: string;
  departments?: unknown[];
  [key: string]: unknown;
}

interface OfflineGradeSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  schoolId: string;
  schoolName?: string;
  sessions?: unknown[];
  isTeacher?: boolean;
  teacherSubjects?: TeacherSubjectItem[];
  activeClassId?: string;
  onOpenRecordModalWithSetup: (setup: {
    classId: string;
    className?: string;
    subject: string;
    category: OfflineAssessmentCategory;
    maxMarks: number;
    initialScores?: Record<string, { score: number; remarks?: string }>;
  }) => void;
}

const CATEGORIES: { value: OfflineAssessmentCategory; label: string; defaultMax: number }[] = [
  { value: 'CA', label: 'Continuous Assessment (CA)', defaultMax: 20 },
  { value: 'QUIZ', label: 'Quiz / Class Test', defaultMax: 10 },
  { value: 'MIDTERM', label: 'Mid-Term Test', defaultMax: 40 },
  { value: 'ASSIGNMENT', label: 'Physical Assignment', defaultMax: 20 },
  { value: 'EXAM', label: 'Terminal / Final Exam', defaultMax: 100 },
];

export default function OfflineGradeSheetSyncModal({
  isOpen,
  onClose,
  classes,
  schoolId,
  schoolName = 'School',
  isTeacher = false,
  teacherSubjects = [],
  activeClassId,
  onOpenRecordModalWithSetup,
}: OfflineGradeSheetSyncModalProps) {
  // 1. Class Selection
  const [selectedClassId, setSelectedClassId] = useState<string>(
    activeClassId || (classes[0]?.id || '')
  );

  React.useEffect(() => {
    if (activeClassId) {
      setSelectedClassId(activeClassId);
    } else if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [activeClassId, classes, selectedClassId]);

  // 2. Fetch selected class details
  const { data: classDetails, isLoading: isLoadingClassDetails } = useSingleClass(selectedClassId);

  // 3. Resolve subjects for selected class
  const availableSubjects = useMemo((): string[] => {
    const rawClassSubjects: string[] = [];

    if (classDetails?.subjects && Array.isArray(classDetails.subjects)) {
      classDetails.subjects.forEach((cs: unknown) => {
        const item = cs as { name?: string; subject?: { name?: string } };
        const name = item.name || item.subject?.name;
        if (name && !rawClassSubjects.includes(name)) {
          rawClassSubjects.push(name);
        }
      });
    }

    if (classDetails?.departments && Array.isArray(classDetails.departments)) {
      classDetails.departments.forEach((cd: unknown) => {
        const dept = cd as { subjects?: unknown[]; department?: { subjects?: unknown[] } };
        const subjects = dept.subjects || dept.department?.subjects || [];
        if (Array.isArray(subjects)) {
          subjects.forEach((s: unknown) => {
            const item = s as { name?: string; subject?: { name?: string } };
            const name = item.name || item.subject?.name;
            if (name && !rawClassSubjects.includes(name)) {
              rawClassSubjects.push(name);
            }
          });
        }
      });
    }

    if (!isTeacher) {
      return rawClassSubjects;
    }

    const teacherSubjectNames = teacherSubjects.map(ts => (ts.name || '').trim().toLowerCase());
    const matched = rawClassSubjects.filter(s => teacherSubjectNames.includes(s.trim().toLowerCase()));

    if (matched.length > 0) {
      return matched;
    }

    if (teacherSubjects.length > 0) {
      return teacherSubjects.map(ts => ts.name);
    }

    return rawClassSubjects;
  }, [classDetails, isTeacher, teacherSubjects]);

  // 4. Selected Subject, Category, and State
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<OfflineAssessmentCategory>('CA');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (availableSubjects.length > 0) {
      if (!selectedSubject || !availableSubjects.includes(selectedSubject)) {
        setSelectedSubject(availableSubjects[0]);
      }
    } else {
      setSelectedSubject('');
    }
  }, [availableSubjects, selectedSubject]);

  const selectedClassObj = useMemo(() => {
    return classes.find(c => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  const selectedClassName = selectedClassObj?.name
    ? `${selectedClassObj.name} ${selectedClassObj.section || ''}`.trim()
    : 'Class Cohort';

  const currentCategoryConfig = useMemo(() => {
    return CATEGORIES.find(c => c.value === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  const maxMarks = currentCategoryConfig.defaultMax;

interface EnrolledStudentItem {
  id: string;
  name: string;
  code: string;
}

  // Extract enrolled students
  const enrolledStudents: EnrolledStudentItem[] = useMemo(() => {
    if (!classDetails?.enrollments || !Array.isArray(classDetails.enrollments)) {
      return [];
    }
    return classDetails.enrollments.map((enr: unknown) => {
      const item = enr as { student?: { id: string; name?: string; studentCode?: string }; id?: string; name?: string; studentCode?: string };
      const student = item.student || item;
      return {
        id: student.id || '',
        name: student.name || 'Student',
        code: student.studentCode || '',
      };
    }).filter((s: EnrolledStudentItem) => !!s.id);
  }, [classDetails]);

  // 5. Download Template (Excel or CSV)
  const handleDownloadTemplate = useCallback((format: 'xlsx' | 'csv') => {
    if (!selectedClassId) {
      toast.error('Please select an assigned class first.');
      return;
    }

    const students: EnrolledStudentItem[] = enrolledStudents.length > 0
      ? enrolledStudents
      : [
          { id: 'STU-001', name: 'Sample Student 1', code: 'SCH-01' },
          { id: 'STU-002', name: 'Sample Student 2', code: 'SCH-02' },
        ];

    const safeClass = selectedClassName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSub = (selectedSubject || 'General').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Grade_Sheet_Template_${safeClass}_${safeSub}_${selectedCategory}.${format}`;

    const headers = [
      'Student Name',
      'Student Code / Reg No',
      `Score (Max: ${maxMarks})`,
      'Remarks',
    ];

    const rows = students.map((s: EnrolledStudentItem) => [
      s.name,
      s.code || s.id,
      '',
      '',
    ]);

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      worksheet['!cols'] = [
        { wch: 30 }, // Student Name
        { wch: 22 }, // Student Code / Reg No
        { wch: 18 }, // Score
        { wch: 30 }, // Remarks
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Grade Sheet');
      XLSX.writeFile(workbook, filename);
      toast.success(`Downloaded Excel Grade Sheet Template (${students.length} students).`);
    } else {
      const csvRows = [headers.join(','), ...rows.map((r: (string | number)[]) => r.map((c: string | number) => `"${String(c).replace(/"/g, '""')}"`).join(','))];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded CSV Grade Sheet Template (${students.length} students).`);
    }
  }, [selectedClassId, enrolledStudents, selectedClassName, selectedSubject, selectedCategory, maxMarks]);

  // 6. Parse Spreadsheet (Excel / CSV) and open Record Modal
  const processUploadedSpreadsheet = useCallback((file: File) => {
    setIsProcessingFile(true);
    const reader = new FileReader();
    const isBinary = file.name.match(/\.(xlsx|xls)$/i);

    const parseRows = (rows: unknown[][]) => {
      if (rows.length < 2) {
        toast.error('The uploaded spreadsheet is empty or has no student rows.');
        setIsProcessingFile(false);
        return;
      }

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

      // Default column positions if headers aren't explicitly identified
      if (nameColIdx === -1) nameColIdx = 0;
      if (codeColIdx === -1 && idColIdx === -1) codeColIdx = 1;
      if (scoreColIdx === -1) scoreColIdx = 2;
      if (remarksColIdx === -1) remarksColIdx = 3;

      const scoreMap: Record<string, { score: number; remarks?: string }> = {};
      let matchedCount = 0;

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
          (codeVal ? enrolledStudents.find((s: EnrolledStudentItem) => s.code && s.code.toLowerCase().trim() === codeVal.toLowerCase()) : null) ||
          (idVal ? enrolledStudents.find((s: EnrolledStudentItem) => s.id && s.id.trim() === idVal) : null) ||
          (nameVal ? enrolledStudents.find((s: EnrolledStudentItem) => s.name.toLowerCase().trim() === nameVal.toLowerCase()) : null);

        const targetId = matchedStudent ? matchedStudent.id : (idVal || codeVal);

        if (targetId && scoreRaw !== undefined && scoreRaw !== null && scoreRaw !== '') {
          const scoreNum = parseFloat(String(scoreRaw));
          if (!isNaN(scoreNum)) {
            scoreMap[targetId] = { score: scoreNum, remarks };
            matchedCount++;
          }
        }
      }

      setIsProcessingFile(false);
      toast.success(`Successfully parsed ${matchedCount} student score(s) from spreadsheet!`);

      // Close this modal and open Record Offline Assessment Marks with the parsed scores and setup
      onClose();
      onOpenRecordModalWithSetup({
        classId: selectedClassId,
        className: selectedClassName,
        subject: selectedSubject,
        category: selectedCategory,
        maxMarks,
        initialScores: scoreMap,
      });
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
        } catch {
          toast.error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
          setIsProcessingFile(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const workbook = XLSX.read(text, { type: 'string' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
          parseRows(rows);
        } catch {
          toast.error('Failed to parse CSV file.');
          setIsProcessingFile(false);
        }
      };
      reader.readAsText(file);
    }
  }, [enrolledStudents, selectedClassId, selectedClassName, selectedSubject, selectedCategory, maxMarks, onClose, onOpenRecordModalWithSetup]);

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
      processUploadedSpreadsheet(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedSpreadsheet(files[0]);
    }
    e.target.value = '';
  };

  const handleOpenDirectSetup = () => {
    onClose();
    onOpenRecordModalWithSetup({
      classId: selectedClassId,
      className: selectedClassName,
      subject: selectedSubject,
      category: selectedCategory,
      maxMarks,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94vw] max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-2xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60'} flex items-center justify-center shrink-0 shadow-xs`}>
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Offline Grade Sheet Template &amp; Sync
                </DialogTitle>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isTeacher ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'} border`}>
                  <Sparkles size={11} />
                  Offline Sync
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Download the official roster template in Excel or CSV, record scores offline without internet, and drop the file back here to auto-populate the assessment marksheet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 4-Step Visual Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 py-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
            <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
              1
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Select Cohort</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose assigned class &amp; subject.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
            <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
              2
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Download Template</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Excel (.xlsx) or CSV with student roster.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
            <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
              3
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Fill Scores Offline</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Use Excel, Sheets, or WPS (keep IDs).</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
            <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
              4
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Drop to Auto-Sync</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Drag &amp; drop to populate pad.</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-stretch">
          {/* Left Column: Selectors & Download (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Class */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} />
                  Assigned Class
                </label>
                <Select
                  value={selectedClassId}
                  onValueChange={(val) => setSelectedClassId(val)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="z-[90] max-h-56 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id} className="text-xs font-semibold cursor-pointer">
                        {cls.name} {cls.section ? `(${cls.section})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Subject */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} />
                  Curriculum Subject
                </label>
                <Select
                  value={selectedSubject}
                  onValueChange={(val) => setSelectedSubject(val)}
                  disabled={isLoadingClassDetails || availableSubjects.length === 0}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                    <SelectValue placeholder={isLoadingClassDetails ? 'Loading...' : availableSubjects.length === 0 ? 'No subjects' : 'Select Subject'} />
                  </SelectTrigger>
                  <SelectContent className="z-[90] max-h-56 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    {availableSubjects.map((sub) => (
                      <SelectItem key={sub} value={sub} className="text-xs font-semibold cursor-pointer">
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className={isTeacher ? 'text-emerald-500' : 'text-indigo-500'} />
                  Assessment Type
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val as OfflineAssessmentCategory)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="z-[90] rounded-xl dark:bg-slate-800 dark:border-slate-700">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-xs font-semibold cursor-pointer">
                        {cat.label} (Max: {cat.defaultMax})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Template Download Button Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                <span>
                  <strong>{enrolledStudents.length} enrolled students</strong> in {selectedClassName}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedClassId || isLoadingClassDetails}
                    className={`h-10 px-4 rounded-xl ${isTeacher ? 'border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/50' : 'border-indigo-300 text-indigo-800 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950/50'} font-bold text-xs gap-2 cursor-pointer shadow-xs`}
                  >
                    <FileSpreadsheet size={15} />
                    <span>Download Grade Sheet Template</span>
                    <ChevronDown size={13} className="opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[95] w-56 rounded-xl dark:bg-slate-800 dark:border-slate-700">
                  <DropdownMenuItem
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="text-xs font-semibold gap-2 py-2 cursor-pointer"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold">Excel Template (.xlsx)</p>
                      <p className="text-[10px] text-slate-400">For Excel, WPS, Google Sheets</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadTemplate('csv')}
                    className="text-xs font-semibold gap-2 py-2 cursor-pointer"
                  >
                    <FileText size={15} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-bold">CSV Template (.csv)</p>
                      <p className="text-[10px] text-slate-400">Universal plain spreadsheet</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Column: Drag-and-Drop Dropzone (5 cols) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`lg:col-span-5 rounded-2xl border-2 border-dashed transition-all p-4 sm:p-5 flex flex-col items-center justify-center text-center relative ${
              isDragging
                ? isTeacher
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isProcessingFile ? (
              <div className="flex flex-col items-center justify-center gap-2 py-3">
                <Loader2 size={28} className={`animate-spin ${isTeacher ? 'text-emerald-600' : 'text-indigo-600'}`} />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Parsing spreadsheet scores...</p>
                <p className="text-[11px] text-slate-400">Matching student identifiers with roster</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <div className={`size-11 rounded-2xl ${isTeacher ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'} flex items-center justify-center shadow-xs`}>
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Drag &amp; Drop Saved Spreadsheet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Excel (.xlsx, .xls) or CSV with student scores
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 rounded-lg text-xs font-bold border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Browse Files
                  </Button>
                  <span className="text-[11px] text-slate-400 font-medium">or drop file here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-bold text-slate-500"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={handleOpenDirectSetup}
            disabled={!selectedClassId}
            className={`h-10 px-5 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold text-xs sm:text-sm gap-2 shadow-md dark:shadow-none cursor-pointer disabled:opacity-50`}
          >
            <BookOpen size={15} />
            <span>Open Record Marks Pad With This Setup</span>
            <ArrowRight size={14} className="opacity-70" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
