"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, User, Save, AlertCircle, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { gradeService } from '@/lib/api/services/gradeService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/lib/api/hooks/useGrades';
import { apiClient } from '@/lib/api/client';
import { useStudents } from '@/lib/api/hooks/useStudent';

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export default function GradeEntryModal({ isOpen, onClose, schoolId }: GradeEntryModalProps) {
  const queryClient = useQueryClient();

  // Selection state (Exam-First)
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  
  // Scoring metadata
  const [maxMarks, setMaxMarks] = useState('100');
  const [scores, setScores] = useState<Record<string, string>>({});

  // 1. Fetch all exams for this school
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ['exams-for-grades', schoolId],
    queryFn: async () => {
      const res = await apiClient.get('/exams', { params: { schoolId } });
      const list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!isOpen && !!schoolId,
  });
  const exams = (examsData || []) as any[];
  const selectedExam = exams.find((e: any) => e.id === selectedExamId);

  // 2. Fetch papers for selected exam
  const { data: papersData, isLoading: isLoadingPapers } = useQuery({
    queryKey: ['exam-papers-for-grades', selectedExamId],
    queryFn: async () => {
      const res = await apiClient.get(`/exams/${selectedExamId}/papers`);
      const list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!selectedExamId,
  });
  const papers = (papersData || []) as any[];
  const selectedPaper = papers.find((p: any) => p.id === selectedPaperId);

  // Auto-select paper if only one exists
  useEffect(() => {
    if (papers.length === 1 && !selectedPaperId) {
      setSelectedPaperId(papers[0].id);
    }
  }, [papers, selectedPaperId]);

  // 3. Auto-populate max marks from paper
  useEffect(() => {
    if (selectedPaper?.totalMarks) {
      setMaxMarks(String(selectedPaper.totalMarks));
    }
  }, [selectedPaper?.id]);

  // 4. Load candidates from the exam's context
  const classId = selectedExam?.classId || '';
  const departmentId = selectedExam?.departments?.[0]?.departmentId || 
                       selectedExam?.departments?.[0]?.id || '';

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(schoolId, {
    classId: classId || undefined,
    departmentId: departmentId || undefined,
  });
  const students = (studentsData || []) as any[];

  // 5. Fetch existing grades for this combination
  const { data: existingGradesMap } = useQuery({
    queryKey: ['existing-grades-lookup', selectedExamId, selectedPaperId],
    queryFn: async () => {
      const res = await apiClient.get('/grades/hub', {
        params: { schoolId, examId: selectedExamId, subjectPaperId: selectedPaperId || undefined },
      });
      const list = res.data?.data || [];
      return Object.fromEntries((list as any[]).map((g: any) => [g.studentId, g]));
    },
    enabled: !!selectedExamId && !!selectedPaperId && !!isOpen,
  });

  // Handlers
  const handleExamChange = (val: string) => {
    setSelectedExamId(val);
    setSelectedPaperId('');
    setScores({});
  };

  // Sync scores with existing grades
  useEffect(() => {
    if (!students.length) return;
    const init: Record<string, string> = {};
    students.forEach((s: any) => {
      const existing = existingGradesMap?.[s.id];
      init[s.id] = existing ? String(existing.score) : '';
    });
    setScores(init);
  }, [students.map((s: any) => s.id).join(','), selectedExamId, selectedPaperId, existingGradesMap]);

  const mutation = useMutation({
    mutationFn: async () => {
      const gradesToCreate = Object.entries(scores)
        .filter(([studentId, score]) => {
          if (score === '') return false;
          // Filter out results that are from an online attempt (locked)
          const existing = existingGradesMap?.[studentId];
          const isOnline = !!(existing?.examAttemptId || existing?.subjectExamAttemptId);
          return !isOnline;
        })
        .map(([studentId, score]) => ({
          studentId,
          schoolId,
          classId: classId || undefined,
          examId: selectedExamId,
          subjectPaperId: selectedPaperId || undefined,
          subject: selectedPaper?.subject?.name || selectedPaper?.title || '',
          category: selectedExam?.category || 'EXAM',
          term: selectedExam?.term || 'FIRST',
          maxMarks: Number(maxMarks),
          score: Number(score),
          weight: 1.0,
          status: 'DRAFT',
        }));
      return gradeService.bulkCreateGrades(schoolId, gradesToCreate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
      onClose();
      setSelectedExamId('');
      setSelectedPaperId('');
      setScores({});
    },
  });

  const scoredCount = Object.values(scores).filter(s => s !== '').length;
  const isFormValid = !!selectedExamId && !!selectedPaperId && scoredCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-2xl">
        <DialogHeader>
          <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
            <Save size={28} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Grade Entry
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-1">
              {selectedExam ? (
                <span className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-tight">
                  <BookOpen size={12} />
                  {selectedExam.title}
                  {selectedPaper ? (
                    <>
                      <ChevronRight size={12} className="text-slate-300" />
                      <span className="text-slate-500">{selectedPaper.title}</span>
                    </>
                  ) : null}
                </span>
              ) : (
                <span className="text-slate-500 font-medium">Step ①: Select an exam record</span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Metadata */}
        <div className="grid gap-5 py-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Step 1: Exam Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                ① Exam / Quiz Record
              </Label>
              <Select value={selectedExamId} onValueChange={handleExamChange}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold">
                  <SelectValue placeholder={isLoadingExams ? 'Loading exams...' : 'Choose exam...'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {exams.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title} {e.category ? `[${e.category}]` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Subject Paper Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                ② Subject Paper
              </Label>
              <Select
                value={selectedPaperId}
                onValueChange={setSelectedPaperId}
                disabled={!selectedExamId}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold">
                  <SelectValue placeholder={
                    !selectedExamId ? 'Select exam first' 
                    : papers.length === 0 && !isLoadingPapers ? 'No papers linked' 
                    : 'Choose paper...'
                  } />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {papers.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} {p.totalMarks ? `(${p.totalMarks} marks)` : ''}
                    </SelectItem>
                  ))}
                  {isLoadingPapers && (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Marks</Label>
              <Input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold"
              />
            </div>
            {/* Context metadata */}
            <div className="flex flex-wrap gap-2 items-end pb-1">
              {selectedExam?.class && (
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                  Class: {selectedExam.class.name}
                </span>
              )}
              {selectedExam?.term && (
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                  Term: {selectedExam.term}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Student Entry Grid */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <User size={14} className="text-indigo-500" />
            ③ Score Candidates
            {scoredCount > 0 && (
              <span className="ml-auto text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                {scoredCount} filled
              </span>
            )}
          </h4>

          {!selectedExamId ? (
            <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={32} className="mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Please select an exam record</p>
            </div>
          ) : !selectedPaperId ? (
            <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={32} className="mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Select a subject paper to load students</p>
            </div>
          ) : isLoadingStudents ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading candidates...</span>
            </div>
          ) : (
            <div className="grid gap-2">
              {students.map((student: any) => {
                const existing = existingGradesMap?.[student.id];
                const hasExisting = !!existing;
                const isOnline = !!(existing?.examAttemptId || existing?.subjectExamAttemptId);
                
                return (
                  <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl group transition-all ${
                    isOnline ? 'bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/50' :
                    hasExisting ? 'bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200' : 
                    'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                        isOnline ? 'bg-indigo-100 text-indigo-600' :
                        hasExisting ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                        'bg-white dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isOnline ? <AlertCircle size={20} /> : hasExisting ? <CheckCircle2 size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">{student.name}</span>
                        {hasExisting && (
                          <div className="flex items-center gap-2 mt-0.5">
                            {isOnline ? (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest">Automatic</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest">Manual</span>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${isOnline ? 'text-indigo-600' : 'text-emerald-600'}`}>
                              {isOnline ? 'Online Result: ' : 'Manual Entry: '}{existing.score}/{existing.maxMarks}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Score"
                        value={scores[student.id] || ''}
                        onChange={(e) => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                        disabled={isOnline}
                        className={`w-24 h-10 text-right rounded-xl font-black bg-white dark:bg-slate-900 shadow-sm ${
                          isOnline ? 'border-indigo-200 text-indigo-600 opacity-70 cursor-not-allowed bg-indigo-50/30' :
                          hasExisting ? 'border-emerald-200 text-emerald-600 focus:ring-emerald-500/10' : 
                          'border-slate-200 focus:ring-indigo-500/10'
                        }`}
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase">/ {maxMarks}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-8 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold transition-all">
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !isFormValid}
            className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : `Save ${scoredCount || ''} Grades`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
