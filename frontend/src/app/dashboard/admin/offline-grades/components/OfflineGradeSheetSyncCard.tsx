"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Loader2,
  FileText
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

interface OfflineGradeSheetSyncCardProps {
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

export default function OfflineGradeSheetSyncCard({
  classes,
  schoolId,
  schoolName = 'School',
  isTeacher = false,
  teacherSubjects = [],
  activeClassId,
  onOpenRecordModalWithSetup,
}: OfflineGradeSheetSyncCardProps) {
  // 1. Class Selection
  const [selectedClassId, setSelectedClassId] = useState<string>(
    activeClassId || (classes[0]?.id || '')
  );

  // Sync when activeClassId or classes change
  React.useEffect(() => {
    if (activeClassId) {
      setSelectedClassId(activeClassId);
    } else if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [activeClassId, classes, selectedClassId]);

  // 2. Fetch selected class details (enrolled students & class subjects)
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

    // If teacher, prioritize assigned subjects
    const teacherSubjectNames = teacherSubjects.map(ts => (ts.name || '').trim().toLowerCase());
    const matched = rawClassSubjects.filter(s => teacherSubjectNames.includes(s.trim().toLowerCase()));

    if (matched.length > 0) {
      return matched;
    }

    // Fallback: teacher's assigned subjects directly
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

  // Auto-select first subject when available
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
        if (rowStr.includes('student') || rowStr.includes('score') || rowStr.includes('id')) {
          headerRowIndex = r;
          break;
        }
      }

      const headerRow = rows[headerRowIndex] || [];
      let idColIdx = 0;
      let nameColIdx = 1;
      let scoreColIdx = 3;
      let remarksColIdx = 4;

      headerRow.forEach((col, idx) => {
        const str = String(col || '').toLowerCase();
        if (str.includes('id') && !str.includes('code')) idColIdx = idx;
        else if (str.includes('name')) nameColIdx = idx;
        else if (str.includes('score') || str.includes('mark')) scoreColIdx = idx;
        else if (str.includes('remark')) remarksColIdx = idx;
      });

      const scoreMap: Record<string, { score: number; remarks?: string }> = {};
      let matchedCount = 0;

      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const studentId = String(row[idColIdx] ?? '').trim();
        const studentName = String(row[nameColIdx] ?? '').trim();
        const scoreRaw = row[scoreColIdx];
        const remarks = String(row[remarksColIdx] ?? '').trim();

        if (!studentId && !studentName) continue;

        const matchedStudent = enrolledStudents.find((s: EnrolledStudentItem) => s.id && s.id.trim() === studentId) ||
          enrolledStudents.find((s: EnrolledStudentItem) => s.name.toLowerCase().trim() === studentName.toLowerCase());

        const targetId = matchedStudent ? matchedStudent.id : studentId;

        if (scoreRaw !== undefined && scoreRaw !== null && scoreRaw !== '') {
          const scoreNum = parseFloat(String(scoreRaw));
          if (!isNaN(scoreNum)) {
            scoreMap[targetId] = { score: scoreNum, remarks };
            matchedCount++;
          }
        }
      }

      setIsProcessingFile(false);
      toast.success(`Successfully parsed ${matchedCount} student score(s) from spreadsheet!`);

      // Open the Record Offline Assessment Marks modal with this setup auto-selected and scores prefilled!
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
  }, [enrolledStudents, selectedClassId, selectedClassName, selectedSubject, selectedCategory, maxMarks, onOpenRecordModalWithSetup]);

  // Drag and Drop handlers
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
    // reset input
    e.target.value = '';
  };

  const handleOpenDirectSetup = () => {
    onOpenRecordModalWithSetup({
      classId: selectedClassId,
      className: selectedClassName,
      subject: selectedSubject,
      category: selectedCategory,
      maxMarks,
    });
  };

  const accentColor = isTeacher ? 'emerald' : 'indigo';

  return (
    <div className={`w-full rounded-2xl sm:rounded-3xl border ${isTeacher ? 'border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/20' : 'border-indigo-200/90 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-indigo-950/20'} p-4 sm:p-6 md:p-7 shadow-sm transition-all relative overflow-hidden mb-6`}>
      {/* Decorative Blur */}
      <div className={`absolute top-0 right-0 -mt-10 -mr-10 size-48 ${isTeacher ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} rounded-full blur-2xl pointer-events-none`} />

      {/* Header & Steps Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${isTeacher ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300'}`}>
              <Sparkles size={13} />
              Offline Spreadsheet Sync
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Work Offline & Safe Sync
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Offline Grade Sheet Sync & Template Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
            Select your assigned class and subject, download the pre-filled grade sheet, enter scores offline, then drag-and-drop the file back here to auto-populate the marksheet pad.
          </p>
        </div>

        {/* Action Button: Directly Launch Modal with This Setup */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            onClick={handleOpenDirectSetup}
            disabled={!selectedClassId}
            className={`h-10 sm:h-11 px-4 sm:px-5 rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} text-white font-bold text-xs sm:text-sm gap-2 shadow-md dark:shadow-none cursor-pointer disabled:opacity-50`}
          >
            <BookOpen size={16} />
            <span>Record Offline Marks</span>
            <ArrowRight size={14} className="opacity-70" />
          </Button>
        </div>
      </div>

      {/* 4-Step Interactive Guide Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 py-4 text-xs">
        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
          <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
            1
          </span>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Select Cohort & Subject</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose your assigned class and curriculum subject below.</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
          <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
            2
          </span>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Download Grade Sheet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Get official Excel (.xlsx) or CSV template with enrolled students.</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
          <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
            3
          </span>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Enter Scores Offline</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Fill in scores in Excel, Sheets, or WPS Office (keep IDs intact).</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5">
          <span className={`size-5 rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
            4
          </span>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Drop to Auto-Sync</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Drag & drop the saved sheet to immediately load scores.</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Download / Dropzone Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 items-stretch">
        {/* Left Column: Selectors (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4">
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
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="z-[70] max-h-56 rounded-xl dark:bg-slate-800 dark:border-slate-700">
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
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                  <SelectValue placeholder={isLoadingClassDetails ? 'Loading subjects...' : availableSubjects.length === 0 ? 'No subjects found' : 'Select Subject'} />
                </SelectTrigger>
                <SelectContent className="z-[70] max-h-56 rounded-xl dark:bg-slate-800 dark:border-slate-700">
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
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="z-[70] rounded-xl dark:bg-slate-800 dark:border-slate-700">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs font-semibold cursor-pointer">
                      {cat.label} (Max: {cat.defaultMax})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Download Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              <DropdownMenuContent align="end" className="z-[70] w-56 rounded-xl dark:bg-slate-800 dark:border-slate-700">
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
                ? 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/40'
                : 'border-indigo-500 bg-indigo-100/60 dark:bg-indigo-950/40'
              : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-slate-400'
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
                  Drag & Drop Saved Spreadsheet
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
    </div>
  );
}
