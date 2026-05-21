"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User, Save, AlertCircle, BookOpen, CheckCircle2, ChevronRight, UserPlus, FileText } from 'lucide-react';
import { gradeService } from '@/lib/api/services/gradeService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/lib/api/hooks/useGrades';
import { apiClient } from '@/lib/api/client';
import { useStudents } from '@/lib/api/hooks/useStudent';
import AddStudentDialog from '../../students/components/AddStudentDialog';

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export default function GradeEntryModal({ isOpen, onClose, schoolId }: GradeEntryModalProps) {
  const queryClient = useQueryClient();

  // Selection state
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  
  // Create Student dialog state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Scoring metadata
  const [maxMarks, setMaxMarks] = useState('100');
  const [scores, setScores] = useState<Record<string, string>>({});

  // 1. Fetch all exams for this school (includes papers in subjectExamPapers)
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
  const selectedPaper = selectedExam?.subjectExamPapers?.find((p: any) => p.id === selectedPaperId);

  // 2. Auto-populate max marks from paper
  useEffect(() => {
    if (selectedPaper?.totalMarks) {
      setMaxMarks(String(selectedPaper.totalMarks));
    }
  }, [selectedPaper?.id]);

  // 3. Load candidates from the exam's context
  const classId = selectedExam?.classId || '';
  const departmentId = selectedExam?.departments?.[0]?.departmentId || 
                       selectedExam?.departments?.[0]?.id || '';

  const { data: studentsData, isLoading: isLoadingStudents, refetch: refetchStudents } = useStudents(schoolId, {
    classId: classId || undefined,
    departmentId: departmentId || undefined,
  });
  
  const students = (studentsData || []) as any[];

  // Refetch students explicitly when returning from Add Student Dialog
  useEffect(() => {
    if (!isAddStudentOpen && selectedExamId && selectedPaperId) {
      // Invalidate grades lookup as well to ensure sync
      queryClient.invalidateQueries({ queryKey: ['existing-grades-lookup'] });
      refetchStudents();
    }
  }, [isAddStudentOpen, selectedExamId, selectedPaperId, queryClient, refetchStudents]);

  // 4. Fetch existing grades for this combination
  const { data: existingGradesMap, isLoading: isLoadingGrades } = useQuery({
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
          const existing = existingGradesMap?.[studentId];
          const isOnline = !!(existing?.examAttemptId || existing?.subjectExamAttemptId);
          return !isOnline; // filter out online attempts
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

  const handleSelectPaper = (examId: string, paperId: string) => {
    setSelectedExamId(examId);
    setSelectedPaperId(paperId);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1000px] h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary dark:bg-primary/10 text-primary dark:text-primary flex items-center justify-center shadow-inner">
                <Save size={28} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Grade Entry
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="mt-1">
                    {selectedExam ? (
                      <span className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tight">
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
                      <span className="text-slate-500 font-medium">Select an exam and subject paper to begin</span>
                    )}
                  </div>
                </DialogDescription>
              </div>
            </div>
            
            {/* Action Buttons */}
            {selectedExamId && selectedPaperId && (
              <Button 
                onClick={() => setIsAddStudentOpen(true)}
                variant="outline" 
                className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Student
              </Button>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Pane: Exams & Papers Navigator */}
            <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-4 custom-scrollbar">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
                Available Exams
              </h3>
              
              {isLoadingExams ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl bg-slate-100 dark:bg-slate-800/50" />
                  ))}
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center p-6 text-slate-400">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold uppercase">No exams found</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {exams.map((exam: any) => (
                    <AccordionItem key={exam.id} value={exam.id} className="border-none">
                      <AccordionTrigger className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors data-[state=open]:bg-primary/5 data-[state=open]:text-primary border border-transparent data-[state=open]:border-primary/10">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-bold text-sm">{exam.title}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                            {exam.category || 'EXAM'} • {exam.subjectExamPapers?.length || 0} Papers
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0 px-1 space-y-1">
                        {exam.subjectExamPapers?.length === 0 ? (
                          <div className="p-3 text-center text-[10px] font-bold text-slate-400 uppercase">
                            No papers linked
                          </div>
                        ) : (
                          exam.subjectExamPapers?.map((paper: any) => {
                            const isSelected = selectedPaperId === paper.id;
                            return (
                              <button
                                key={paper.id}
                                onClick={() => handleSelectPaper(exam.id, paper.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                                  isSelected 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <FileText size={16} className={isSelected ? 'text-primary-foreground' : 'text-slate-400'} />
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold truncate max-w-[200px]">{paper.title}</span>
                                  {paper.totalMarks && (
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-primary-foreground/80' : 'text-slate-400'}`}>
                                      Max: {paper.totalMarks} marks
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            {/* Right Pane: Grading Grid */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
              {!selectedPaperId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <BookOpen size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">Ready to Grade</p>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">
                    Select an exam and subject paper from the sidebar to begin entering scores.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedPaper?.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedExam?.class && (
                          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                            Class: {selectedExam.class.name}
                          </span>
                        )}
                        {selectedExam?.term && (
                          <span className="px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                            Term: {selectedExam.term}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Max Marks</Label>
                        <Input
                          type="number"
                          value={maxMarks}
                          onChange={(e) => setMaxMarks(e.target.value)}
                          className="h-10 w-24 text-center rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                      <User size={14} className="text-primary" />
                      Score Candidates
                      {scoredCount > 0 && (
                        <span className="ml-auto text-[10px] font-black text-primary bg-primary/5 dark:bg-primary/10 px-3 py-1 rounded-full">
                          {scoredCount} filled
                        </span>
                      )}
                    </h4>

                    {isLoadingStudents || isLoadingGrades ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" />
                        ))}
                      </div>
                    ) : students.length === 0 ? (
                      <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <UserPlus size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-black uppercase tracking-widest mb-4">No candidates found</p>
                        <Button 
                          onClick={() => setIsAddStudentOpen(true)}
                          variant="outline" 
                          className="rounded-xl font-bold uppercase tracking-widest text-xs"
                        >
                          Create Student Now
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {students.map((student: any) => {
                          const existing = existingGradesMap?.[student.id];
                          const hasExisting = !!existing;
                          const isOnline = !!(existing?.examAttemptId || existing?.subjectExamAttemptId);
                          
                          return (
                            <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl group transition-all ${
                              isOnline ? 'bg-primary/5 dark:bg-primary/5 border border-primary/50' :
                              hasExisting ? 'bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200' : 
                              'bg-white dark:bg-slate-900 hover:shadow-md border border-slate-100 dark:border-slate-800'
                            }`}>
                              <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm ${
                                  isOnline ? 'bg-primary text-primary' :
                                  hasExisting ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                                  'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                }`}>
                                  {isOnline ? <AlertCircle size={24} /> : hasExisting ? <CheckCircle2 size={24} /> : <User size={24} />}
                                </div>
                                <div>
                                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                                    {student.name}
                                  </span>
                                  {hasExisting ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      {isOnline ? (
                                        <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest">Automatic</span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest">Manual</span>
                                      )}
                                      <span className={`text-[10px] font-bold uppercase tracking-tight ${isOnline ? 'text-primary' : 'text-emerald-600'}`}>
                                        {isOnline ? 'Online Result: ' : 'Manual Entry: '}{existing.score}/{existing.maxMarks}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                                      Pending Grade
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="number"
                                  placeholder="Score"
                                  value={scores[student.id] || ''}
                                  onChange={(e) => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                                  disabled={isOnline}
                                  className={`w-24 h-12 text-center rounded-xl font-black text-lg bg-slate-50 dark:bg-slate-950 shadow-inner ${
                                    isOnline ? 'border-primary text-primary opacity-70 cursor-not-allowed bg-primary/5/30' :
                                    hasExisting ? 'border-emerald-200 text-emerald-600 focus:ring-emerald-500/10' : 
                                    'border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary'
                                  }`}
                                />
                                <span className="text-xs font-black text-slate-400 uppercase w-12">/ {maxMarks}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 gap-4">
            <Button variant="outline" onClick={onClose} className="w-40 h-12 rounded-xl font-bold uppercase tracking-widest transition-all">
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !isFormValid}
              className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
              {mutation.isPending ? 'Saving...' : `Save ${scoredCount || ''} Grades`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Sub-Dialog */}
      <AddStudentDialog 
        open={isAddStudentOpen} 
        onOpenChange={setIsAddStudentOpen} 
      />
    </>
  );
}
