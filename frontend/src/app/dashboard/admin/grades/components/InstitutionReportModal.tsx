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

  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
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
      // To keep it performant, we'll fetch them in parallel but limited
      const examsWithData = await Promise.all(
        filteredExams.map(async (exam) => {
          const attempts = await examService.getExamAttempts(exam.id);
          return { ...exam, attempts };
        })
      );

      // 3. Generate PDF
      const doc = <InstitutionComprehensiveReport 
        school={school} 
        exams={examsWithData} 
        filters={filters}
        sessions={sessions}
        classes={classes}
      />;
      
      const blob = await pdf(doc).toBlob();
      saveAs(blob, `Institution_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      onClose();
    } catch (error) {
      console.error("Failed to generate institution report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-2xl">
        <DialogHeader>
          <div className="h-16 w-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
             <Filter size={32} strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Export School Report</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Configure filters to generate a comprehensive academic performance report for your school.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {/* Session & Term */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Session</Label>
              <Select value={filters.sessionId} onValueChange={(val) => setFilters({...filters, sessionId: val})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold focus:ring-4 transition-all" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessions.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Term</Label>
              <Select value={filters.term} onValueChange={(val) => setFilters({...filters, term: val})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold">
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="FIRST">First Term</SelectItem>
                  <SelectItem value="SECOND">Second Term</SelectItem>
                  <SelectItem value="THIRD">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Class */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assessment Type</Label>
              <Select value={filters.category} onValueChange={(val) => setFilters({...filters, category: val})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold focus:ring-4 transition-all" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="EXAM">Final Exams</SelectItem>
                  <SelectItem value="QUIZ">Quizzes / Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Class / Level</Label>
              <Select value={filters.classId} onValueChange={(val) => setFilters({...filters, classId: val})}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="h-12 pl-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold focus:ring-4 focus:outline-none transition-all" 
                  style={{ '--tw-ring-color': `${primaryColor}20`, focusBorderColor: primaryColor } as any}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="h-12 pl-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold focus:ring-4 focus:outline-none transition-all" 
                  style={{ '--tw-ring-color': `${primaryColor}20`, focusBorderColor: primaryColor } as any}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isGenerating}
            className="flex-1 h-12 rounded-xl text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-0 relative overflow-hidden group"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}60` }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 animate-spin relative z-10" size={18} />
                <span className="relative z-10">Processing...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 relative z-10" size={18} strokeWidth={3} />
                <span className="relative z-10">Export PDF</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

