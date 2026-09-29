"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Filter, Loader2 } from 'lucide-react';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import InstitutionComprehensiveReport from './InstitutionComprehensiveReport';
import { examService } from '@/lib/api/services/examService';

interface InstitutionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: any;
  primaryColor?: string;
}

export default function InstitutionReportModal({ isOpen, onClose, school, primaryColor = '#2563eb' }: InstitutionReportModalProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: classes } = useClasses(schoolId);
  const { data: sessionsData } = useSessions(schoolId);
  const sessions = sessionsData?.data || [];

  const [filters, setFilters] = useState({
    sessionId: 'all',
    term: 'all',
    category: 'all',
    classId: 'all',
    startDate: '',
    endDate: '',
  });

  const [isGenerating, setIsGenerating] = useState<'pdf' | 'excel' | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsGenerating(format);
    try {
      // 1. Fetch filtered exams
      const examFilters: any = { schoolId };
      if (filters.sessionId !== 'all') examFilters.sessionId = filters.sessionId;
      if (filters.term !== 'all') examFilters.term = filters.term;
      if (filters.category !== 'all') examFilters.category = filters.category;
      if (filters.classId !== 'all') examFilters.classId = filters.classId;
      
      const exams = await examService.getExams(examFilters);
      
      // Filter by date if provided
      let filteredExams = exams;
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        filteredExams = filteredExams.filter(e => new Date(e.createdAt) >= start);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        filteredExams = filteredExams.filter(e => new Date(e.createdAt) <= end);
      }

      // 2. Fetch attempts for these exams to get aggregate data
      const examsWithData = await Promise.all(
        filteredExams.map(async (exam) => {
          const attempts = await examService.getExamAttempts(exam.id);
          return { ...exam, attempts };
        })
      );

      const schoolName = school?.name || "Institution";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filenameBase = `${sanitizedSchoolName}_report_${new Date().toISOString().split('T')[0]}`;

      if (format === 'pdf') {
        // 3. Generate PDF
        const doc = <InstitutionComprehensiveReport 
          school={school} 
          exams={examsWithData} 
          filters={filters}
          sessions={sessions}
          classes={classes}
        />;
        
        const blob = await pdf(doc).toBlob();
        saveAs(blob, `${filenameBase}.pdf`);
      } else {
        // Generate Excel separated by class
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        if (examsWithData.length === 0) {
           const ws = XLSX.utils.aoa_to_sheet([["No data available for the selected filters"]]);
           XLSX.utils.book_append_sheet(wb, ws, "Report");
        } else {
           // Group exams by classId
           const examsByClass: Record<string, typeof examsWithData> = {};
           examsWithData.forEach(exam => {
              const cid = exam.classId || 'Unassigned';
              if (!examsByClass[cid]) examsByClass[cid] = [];
              examsByClass[cid].push(exam);
           });

           for (const [classId, classExams] of Object.entries(examsByClass)) {
              const classInfo = classes?.find((c: any) => c.id === classId);
              let sheetName = classInfo ? `${classInfo.name} ${classInfo.section || ''}`.trim() : 'Unassigned';
              sheetName = sheetName.replace(/[/*?:\[\]\\]/g, '').substring(0, 31);

              const wsData: any[][] = [];
              
              // Header rows
              wsData.push([schoolName.toUpperCase()]);
              if (school?.motto) wsData.push([school.motto]);
              const contactStr = [school?.phone, school?.schoolEmail].filter(Boolean).join(' | ');
              if (contactStr) wsData.push([contactStr]);
              wsData.push([]);
              wsData.push([`Class Report - ${sheetName}`]);
              wsData.push([`Generated: ${new Date().toISOString().split('T')[0]}`]);
              wsData.push([]);
              
              wsData.push([]);
              
              const examsByCategory: Record<string, typeof classExams> = {};
              classExams.forEach(exam => {
                  let cat = (((exam as any).assessmentType) || exam.category || 'OTHER').toUpperCase().trim();
                  if (cat === 'MIDTERM' || cat.includes('CONTINUOUS')) cat = 'CA';
                  else if (cat.includes('PROJECT') || cat.includes('HOMEWORK') || cat.includes('CLASSWORK')) cat = 'ASSIGNMENT';
                  else if (cat.includes('TEST')) cat = 'QUIZ';
                  
                  if (!examsByCategory[cat]) examsByCategory[cat] = [];
                  examsByCategory[cat].push(exam);
              });

              for (const [catName, catExams] of Object.entries(examsByCategory)) {
                 wsData.push([`${catName} SECTION`]);
                 wsData.push(["Examination Title", "Type", "Date", "Total Students", "Mean %", "Pass %"]);
                 
                 catExams.forEach(exam => {
                    const eAttempts = exam.attempts || [];
                    const eAvg = eAttempts.length > 0 
                        ? (eAttempts.reduce((sum: number, a: any) => sum + (a.totalScore / a.totalMarks) * 100, 0) / eAttempts.length).toFixed(1)
                        : '0';
                    const ePass = eAttempts.length > 0
                        ? ((eAttempts.filter((a: any) => (a.totalScore / a.totalMarks) >= 0.4).length / eAttempts.length) * 100).toFixed(0)
                        : '0';
                        
                    wsData.push([
                       exam.title,
                       exam.category || catName,
                       new Date(exam.startDate || exam.createdAt).toLocaleDateString(),
                       eAttempts.length,
                       `${eAvg}%`,
                       `${ePass}%`
                    ]);
                 });
                 wsData.push([]);
              }

              wsData.push(["--- Student Performance ---"]);
              
              const studentScores = new Map<string, {name: string, totalScore: number, count: number}>();
              
              classExams.forEach(exam => {
                 const eAttempts = exam.attempts || [];
                 eAttempts.forEach((a: any) => {
                     const sid = a.studentId;
                     if (!studentScores.has(sid)) {
                         studentScores.set(sid, { name: a.student?.name || 'Unknown', totalScore: 0, count: 0 });
                     }
                     const st = studentScores.get(sid)!;
                     st.totalScore += (a.totalScore / a.totalMarks) * 100;
                     st.count += 1;
                 });
              });
              
              const sortedStudents = Array.from(studentScores.values())
                 .map(s => ({ name: s.name, avg: s.totalScore / s.count }))
                 .sort((a, b) => b.avg - a.avg);
                 
              sortedStudents.forEach((s, idx) => {
                 wsData.push([s.name, `${s.avg.toFixed(1)}%`]);
              });

              const ws = XLSX.utils.aoa_to_sheet(wsData);
              
              let finalSheetName = sheetName;
              let suffix = 1;
              while (wb.SheetNames.includes(finalSheetName)) {
                  finalSheetName = `${sheetName.substring(0, 27)}_${suffix}`;
                  suffix++;
              }
              
              XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
           }
        }
        
        XLSX.writeFile(wb, `${filenameBase}.xlsx`);
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to generate institution report:", error);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-[#1a1b2e] dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Export School Report</DialogTitle>
          <DialogDescription className="text-slate-500">
            Configure filters to generate a comprehensive academic performance report.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Session & Term */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Academic Session</label>
              <select value={filters.sessionId} onChange={(e) => setFilters({...filters, sessionId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                <option value="all">All Sessions</option>
                {sessions.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Academic Term</label>
              <select value={filters.term} onChange={(e) => setFilters({...filters, term: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                <option value="all">All Terms</option>
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
            </div>
          </div>

          {/* Category & Class */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assessment Type</label>
              <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                <option value="all">All Types</option>
                <option value="CA">Continuous Assessment (CA)</option>
                <option value="ASSIGNMENT">Assignments</option>
                <option value="EXAM">Final Exams</option>
                <option value="QUIZ">Quizzes / Tests</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class / Level</label>
              <select value={filters.classId} onChange={(e) => setFilters({...filters, classId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                <option value="all">All Classes</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From Date</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To Date</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all" 
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <button 
            onClick={onClose}
            className="flex-1 items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button 
            onClick={() => handleExport('excel')}
            disabled={isGenerating !== null}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isGenerating === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Excel
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isGenerating !== null}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isGenerating === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

