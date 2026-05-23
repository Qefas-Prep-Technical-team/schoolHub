"use client";

import React, { useState, useRef } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Camera, Sparkles, CheckCircle2, User, Edit3, Trash2, SplitSquareVertical, BookOpen, ChevronRight, AlertCircle, UserPlus, FileText, Search, Info } from 'lucide-react';
import { gradeService } from '@/lib/api/services/gradeService';
import { imageService } from '@/lib/api/services/imageService';
import { adminService } from '@/lib/api/services/adminService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/lib/api/hooks/useGrades';
import { useStudents } from '@/lib/api/hooks/useStudent';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import Image from 'next/image';

interface GradeOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export default function GradeOCRModal({ isOpen, onClose, schoolId }: GradeOCRModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 1. Fetch all exams for this school
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ['exams-for-ocr', schoolId],
    queryFn: async () => {
      const res = await apiClient.get('/exams', { params: { schoolId } });
      const list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!isOpen && !!schoolId,
  });
  const exams = (examsData || []) as any[];

  // 2. Selection state
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');

  // 3. Fetch papers for selected exam
  const { data: papersData, isLoading: isLoadingPapers } = useQuery({
    queryKey: ['exam-papers-for-ocr', selectedExamId],
    queryFn: async () => {
      const res = await apiClient.get(`/exams/${selectedExamId}/papers`);
      const list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!selectedExamId,
  });
  const papers = (papersData || []) as any[];

  const selectedExam = exams.find((e: any) => e.id === selectedExamId);
  const selectedPaper = papers.find((p: any) => p.id === selectedPaperId);

  const [step, setStep] = useState<'upload' | 'processing' | 'verify' | 'reconcile'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedGrades, setExtractedGrades] = useState<any[]>([]);
  const [showFullImage, setShowFullImage] = useState(false);
  const [maxMarks, setMaxMarks] = useState('100');

  const [matchedData, setMatchedData] = useState<any[]>([]);
  const [unmatchedData, setUnmatchedData] = useState<any[]>([]);
  const [outOfClassData, setOutOfClassData] = useState<any[]>([]);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const classId = selectedExam?.classId || '';
  const departmentId = selectedExam?.departments?.[0]?.departmentId || 
                       selectedExam?.departments?.[0]?.id || '';

  const { data: studentsData, isLoading: isLoadingStudents, isFetching: isFetchingStudents } = useStudents(schoolId, {
    classId: classId || undefined,
    departmentId: departmentId || undefined,
  });
  const classStudents = (studentsData || []) as any[];
  const { data: allStudentsData } = useStudents(schoolId);
  const allStudents = (allStudentsData || []) as any[];

  const filteredStudents = classStudents.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch existing grades for this combination
  const { data: existingGradesMap, isLoading: isLoadingGrades, isFetching: isFetchingGrades } = useQuery({
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

  // Auto-populate max marks from paper
  React.useEffect(() => {
    if (selectedPaper?.totalMarks) {
      setMaxMarks(String(selectedPaper.totalMarks));
    }
  }, [selectedPaper?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);

      setStep('processing');
      try {
        // 1. Upload to storage — try proxy first, fallback to Supabase
        toast.loading('Uploading image...', { id: 'ocr-modal' });
        let publicUrl = '';
        try {
          const result = await imageService.proxyUploadToBunny(file);
          publicUrl = result.publicUrl;
        } catch {
          const result = await imageService.uploadToSupabase(file);
          publicUrl = result.publicUrl;
        }

        // 2. Process with AI
        toast.loading('AI is scanning your mark sheet...', { id: 'ocr-modal' });
        const data = await gradeService.processOCR(publicUrl);
        const finalGrades = Array.isArray(data) ? data : (data?.grades || data?.data || []);
        const grades = Array.isArray(finalGrades) ? finalGrades : [];

        if (grades.length === 0) {
          throw new Error('No grades could be extracted from this image.');
        }

        setExtractedGrades(grades);
        setStep('verify');
        toast.success(`Extracted ${grades.length} student records!`, { id: 'ocr-modal' });
      } catch (error: any) {
        console.error('OCR Failed:', error);
        toast.error(error.message || 'Failed to scan image. Please try again.', { id: 'ocr-modal' });
        setStep('upload');
      }
    }
  };

  const processMapping = () => {
    const matched: any[] = [];
    const unmatched: any[] = [];
    const outOfClass: any[] = [];
    
    extractedGrades.forEach(row => {
      const ocrName = row.studentName || row.name || '';
      const ocrScore = row.score || '';
      
      let foundInClass = classStudents.find(s => s.name?.toLowerCase().trim() === ocrName?.toLowerCase().trim());
      
      if (foundInClass) {
        matched.push({ studentId: foundInClass.id, studentName: foundInClass.name, score: ocrScore });
      } else {
        if (ocrName.trim()) {
          // Check if they exist in the school at all
          let foundInSchool = allStudents.find(s => s.name?.toLowerCase().trim() === ocrName?.toLowerCase().trim());
          
          if (foundInSchool) {
             outOfClass.push({ studentId: foundInSchool.id, studentName: foundInSchool.name, score: ocrScore });
          } else {
             unmatched.push({ studentName: ocrName, score: ocrScore });
          }
        }
      }
    });
    
    setMatchedData(matched);
    setUnmatchedData(unmatched);
    setOutOfClassData(outOfClass);
    setStep('reconcile');
  };

  const createMissingMutation = useMutation({
    mutationFn: async () => {
      const newStudents = [];
      for (const un of unmatchedData) {
        const res = await adminService.createStudent({
          fullName: un.studentName,
          classId: classId,
          schoolId: schoolId,
        });
        const createdId = res?.data?.student?.id || res?.data?.id || res?.id;
        if (createdId) {
          newStudents.push({
            studentId: createdId,
            studentName: un.studentName,
            score: un.score
          });
        }
      }
      return newStudents;
    },
    onSuccess: (newlyCreated) => {
      setMatchedData(prev => [...prev, ...newlyCreated]);
      setUnmatchedData([]);
      queryClient.invalidateQueries({ queryKey: ['school-students'] });
      toast.success(`Successfully created ${newlyCreated.length} missing students!`);
    },
    onError: () => {
      toast.error('Failed to create some students. Check required fields or try creating them manually.');
    }
  });

  const updateClassMutation = useMutation({
    mutationFn: async () => {
      return outOfClassData;
    },
    onSuccess: (added) => {
      setMatchedData(prev => [...prev, ...added]);
      setOutOfClassData([]);
      toast.success(`Successfully accepted ${added.length} students to receive grades!`);
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const gradesToCreate = matchedData.map(row => ({
        studentName: row.studentName,
        studentId: row.studentId,
        score: Number(row.score),
        schoolId,
        examId: selectedExamId,
        subjectPaperId: selectedPaperId || undefined,
        classId: selectedExam?.classId,
        term: selectedExam?.term || 'FIRST',
        category: selectedExam?.category || 'EXAM',
        subject: selectedPaper?.subject?.name || selectedPaper?.title || '',
        maxMarks: Number(maxMarks),
        weight: 1.0,
        status: 'DRAFT'
      }));
      return gradeService.bulkCreateGrades(schoolId, gradesToCreate);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
      toast.success(`Successfully saved ${matchedData.length} grade records!`);
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save grades. Please try again.');
    }
  });

  const reset = () => {
    setStep('upload');
    setImagePreview(null);
    setExtractedGrades([]);
    setMatchedData([]);
    setUnmatchedData([]);
    setOutOfClassData([]);
  };

  const updateExtractedGrade = (index: number, field: string, value: any) => {
    const newGrades = [...extractedGrades];
    newGrades[index] = { ...newGrades[index], [field]: value };
    setExtractedGrades(newGrades);
  };

  const removeExtractedGrade = (index: number) => {
    setExtractedGrades(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary dark:bg-primary/10 text-primary dark:text-primary flex items-center justify-center shadow-inner">
              <Camera size={28} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                AI Vision Grade Scanner <Sparkles className="text-amber-400 fill-amber-400" size={24} />
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
                    <span className="text-slate-500 font-medium">Scan physical mark sheets to automatically extract student names and scores.</span>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
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
                <p className="text-[10px] mt-2 opacity-70">Create an exam before adding grades.</p>
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
                          No papers linked.
                          <div className="mt-1 text-[9px] opacity-70">Add a subject paper to this exam to grade.</div>
                        </div>
                      ) : (
                        exam.subjectExamPapers?.map((paper: any) => {
                          const isSelected = selectedPaperId === paper.id;
                          return (
                            <button
                              key={paper.id}
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setSelectedPaperId(paper.id);
                                setStep('upload');
                                setImagePreview(null);
                                setExtractedGrades([]);
                                setMatchedData([]);
                                setUnmatchedData([]);
                                setOutOfClassData([]);
                              }}
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

          {/* Right Pane: Upload & Mapping */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
            {!selectedPaperId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <BookOpen size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">Ready to Upload</p>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">
                  Select an exam and subject paper from the sidebar to begin AI scan.
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

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                  {/* ALL THE STEPS: upload, processing, verify, reconcile */}

                  {step === 'upload' && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-24 flex flex-col items-center justify-center gap-6 hover:border-primary hover:bg-primary/5/30 transition-all cursor-pointer relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
                    >
                        <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-700 shadow-xl group-hover:shadow-primary/40">
                            <Camera size={48} />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Snap or Upload Mark Sheet</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Our AI will handle the data entry for you</p>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                  )}

                  {step === 'processing' && (
                    <div className="py-32 flex flex-col items-center justify-center gap-8">
                        <div className="relative">
                            <div className="h-32 w-32 border-8 border-primary dark:border-primary/30 rounded-full" />
                            <div className="h-32 w-32 border-8 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
                            <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={40} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Analyzing Physical Assets...</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">GPT-4o Vision is parsing handwriting/print data</p>
                        </div>
                    </div>
                  )}

                  {step === 'verify' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                            {/* Left Side: Original Image */}
                            <div 
                                onClick={() => setShowFullImage(true)}
                                className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative group cursor-zoom-in hover:border-primary/50 transition-all"
                            >
                                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    Original Scan <Sparkles size={10} className="text-amber-400" />
                                </div>
                                {imagePreview && (
                                    <div className="w-full h-full p-4 flex items-center justify-center">
                                        <img 
                                            src={imagePreview} 
                                            alt="Scan Preview" 
                                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-xl">Click to expand</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: AI Extracted Data */}
                            <div className="flex flex-col gap-6 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                        <SplitSquareVertical size={16} className="text-primary" /> Extracted Metadata
                                    </h4>
                                    <span className="text-[10px] font-black text-primary bg-primary/5 dark:bg-primary/10 px-3 py-1 rounded-full border border-primary dark:border-primary/30">{(extractedGrades || []).length} rows found</span>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {(extractedGrades || []).map((grade, i) => (
                                        <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-primary/50 transition-all shadow-sm">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <User size={18} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Input 
                                                    value={grade.studentName} 
                                                    onChange={(e) => updateExtractedGrade(i, 'studentName', e.target.value)}
                                                    className="h-8 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2 bg-primary/5 dark:bg-primary/5 px-2 py-0.5 rounded-lg border border-primary dark:border-primary/30">
                                                        <span className="text-[10px] font-black text-primary">SCORE:</span>
                                                        <Input 
                                                            type="number" 
                                                            value={grade.score} 
                                                            onChange={(e) => updateExtractedGrade(i, 'score', e.target.value)}
                                                            className="w-12 h-6 text-[10px] font-black bg-transparent border-none p-0 focus-visible:ring-0 text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeExtractedGrade(i)}
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {step === 'reconcile' && (
                    <div className="space-y-6">
                        {outOfClassData.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-200 dark:border-amber-900/30 p-6 space-y-4">
                            <h4 className="text-sm font-black text-amber-600 flex items-center gap-2">
                              <AlertCircle size={18} />
                              {outOfClassData.length} Students Not In Class
                            </h4>
                            <p className="text-xs text-amber-700/80">
                              The following students exist in the database, but are not assigned to this class. Do you still want to upload grades for them?
                            </p>
                            <div className="border border-amber-200/50 dark:border-amber-800/50 rounded-xl overflow-hidden max-h-40 overflow-y-auto bg-white/50 dark:bg-slate-900/50 custom-scrollbar">
                                <table className="w-full text-left">
                                  <thead className="bg-amber-100/50 dark:bg-amber-900/20 sticky top-0">
                                      <tr className="border-b border-amber-200/50 dark:border-amber-800/50">
                                        <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-amber-500">Name</th>
                                        <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-amber-500 text-right">Score</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-amber-100 dark:divide-amber-900/20">
                                      {outOfClassData.slice(0, 10).map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-3 px-4 text-xs font-bold text-amber-700 dark:text-amber-300">{row.studentName}</td>
                                            <td className="p-3 px-4 text-xs font-black text-right text-amber-700 dark:text-amber-300">{row.score} / {maxMarks}</td>
                                        </tr>
                                      ))}
                                      {outOfClassData.length > 10 && (
                                        <tr><td colSpan={2} className="p-3 text-center text-[10px] font-bold text-amber-500 italic">... and {outOfClassData.length - 10} more rows</td></tr>
                                      )}
                                  </tbody>
                                </table>
                            </div>
                            <div className="flex gap-3 pt-2">
                               <Button 
                                  onClick={() => setOutOfClassData([])} 
                                  variant="outline" 
                                  className="h-10 text-xs font-bold text-amber-600 hover:bg-amber-100 border-amber-200"
                                  disabled={updateClassMutation.isPending}
                                >
                                 Discard & Continue
                               </Button>
                               <Button 
                                 onClick={() => updateClassMutation.mutate()} 
                                 className="h-10 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                                 disabled={updateClassMutation.isPending}
                               >
                                 {updateClassMutation.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                 Add {outOfClassData.length} Students
                               </Button>
                            </div>
                          </div>
                        )}

                        {unmatchedData.length > 0 && (
                          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-200 dark:border-rose-900/30 p-6 space-y-4">
                            <h4 className="text-sm font-black text-rose-600 flex items-center gap-2">
                              <AlertCircle size={18} />
                              {unmatchedData.length} Unrecognized Students Found
                            </h4>
                            <p className="text-xs text-rose-700/80">
                              The following students from your scan could not be matched to existing records in this class. Would you like to create accounts for them?
                            </p>
                            <div className="border border-rose-200/50 dark:border-rose-800/50 rounded-xl overflow-hidden max-h-40 overflow-y-auto bg-white/50 dark:bg-slate-900/50 custom-scrollbar">
                                <table className="w-full text-left">
                                  <thead className="bg-rose-100/50 dark:bg-rose-900/20 sticky top-0">
                                      <tr className="border-b border-rose-200/50 dark:border-rose-800/50">
                                        <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-rose-500">Name</th>
                                        <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-rose-500 text-right">Score</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-rose-100 dark:divide-rose-900/20">
                                      {unmatchedData.slice(0, 10).map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-3 px-4 text-xs font-bold text-rose-700 dark:text-rose-300">{row.studentName}</td>
                                            <td className="p-3 px-4 text-xs font-black text-right text-rose-700 dark:text-rose-300">{row.score} / {maxMarks}</td>
                                        </tr>
                                      ))}
                                      {unmatchedData.length > 10 && (
                                        <tr><td colSpan={2} className="p-3 text-center text-[10px] font-bold text-rose-500 italic">... and {unmatchedData.length - 10} more rows</td></tr>
                                      )}
                                  </tbody>
                                </table>
                            </div>
                            <div className="flex gap-3 pt-2">
                               <Button 
                                  onClick={() => setUnmatchedData([])} 
                                  variant="outline" 
                                  className="h-10 text-xs font-bold text-rose-600 hover:bg-rose-100 border-rose-200"
                                  disabled={createMissingMutation.isPending}
                                >
                                 Discard Missing & Continue
                               </Button>
                               <Button 
                                 onClick={() => createMissingMutation.mutate()} 
                                 className="h-10 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                                 disabled={createMissingMutation.isPending}
                               >
                                 {createMissingMutation.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                 Create {unmatchedData.length} Missing Students
                               </Button>
                            </div>
                          </div>
                        )}
                    
                        {matchedData.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 className="text-emerald-500" size={20} />
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{matchedData.length} Records Ready to Save</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setStep('verify')} className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all text-emerald-700">Go Back</Button>
                            </div>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                                      <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                        <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Score</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {matchedData.slice(0, 10).map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-3 px-4 text-xs font-bold">{row.studentName}</td>
                                            <td className="p-3 px-4 text-xs font-black text-right">{row.score} / {maxMarks}</td>
                                        </tr>
                                      ))}
                                      {matchedData.length > 10 && (
                                        <tr><td colSpan={2} className="p-3 text-center text-[10px] font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 italic">... and {matchedData.length - 10} more rows</td></tr>
                                      )}
                                  </tbody>
                                </table>
                            </div>
                          </div>
                        )}

                        {matchedData.length === 0 && unmatchedData.length === 0 && outOfClassData.length === 0 && (
                           <div className="text-center p-8 text-slate-400">
                               <AlertCircle size={32} className="mx-auto mb-4 opacity-50" />
                               <p className="text-sm font-black uppercase tracking-widest">No valid records found</p>
                           </div>
                        )}
                    </div>
                  )}

                  {/* Existing Candidates Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        Existing Candidates
                        <div className="group relative inline-block cursor-help ml-2">
                          <Info size={14} className="text-slate-400 hover:text-primary transition-colors" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
                            Shows students who have already been graded for this paper. The only difference is this was uploaded through image.
                          </div>
                        </div>
                      </h4>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    {isLoadingStudents || isLoadingGrades || isFetchingStudents || isFetchingGrades ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" />
                        ))}
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <User size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-black uppercase tracking-widest mb-2">No candidates found</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {filteredStudents.map((student: any, index: number) => {
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
                                <span className="text-xs font-black text-slate-400 w-5 text-right opacity-50">
                                  {index + 1}.
                                </span>
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                                  isOnline ? 'bg-primary text-primary' :
                                  hasExisting ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                                  'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                }`}>
                                  {isOnline ? <AlertCircle size={18} /> : hasExisting ? <CheckCircle2 size={18} /> : <User size={18} />}
                                </div>
                                <div>
                                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">
                                    {student.name}
                                  </span>
                                  {hasExisting ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      {isOnline ? (
                                        <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[8px] font-black uppercase tracking-widest">Online</span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest">Manual/Image</span>
                                      )}
                                      <span className={`text-[10px] font-bold uppercase tracking-tight ${isOnline ? 'text-primary' : 'text-emerald-600'}`}>
                                        Score: {existing.score}/{existing.maxMarks}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                                      No Grade Yet
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={step === 'upload' ? onClose : reset}
                    className="h-12 px-8 rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 transition-all"
                  >
                    {step === 'upload' ? 'Cancel' : 'Restart Scanner'}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (step === 'verify') processMapping();
                      else if (step === 'reconcile') mutation.mutate();
                    }}
                    disabled={
                      mutation.isPending || 
                      (step === 'verify' && (!selectedExamId || !selectedPaperId)) ||
                      (step === 'reconcile' && (unmatchedData.length > 0 || outOfClassData.length > 0))
                    }
                    className="h-12 px-10 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {mutation.isPending ? <Loader2 className="animate-spin" /> : 
                     step === 'verify' ? 'Map Data' : 
                     step === 'reconcile' ? ((unmatchedData.length > 0 || outOfClassData.length > 0) ? 'Resolve Pending Issues' : 'Submit Grades') : 
                     'Upload Image First'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Full Image Preview Modal */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="sm:max-w-[90vw] h-[90vh] p-4 bg-black/95 border-none rounded-[2rem] flex flex-col items-center justify-center">
          <DialogHeader className="w-full flex flex-row items-center justify-between absolute top-4 left-0 px-8 z-50">
            <DialogTitle className="text-white/80 font-black uppercase tracking-[0.3em] text-xs">Full Scan Inspection</DialogTitle>
            <Button 
                variant="ghost" 
                onClick={() => setShowFullImage(false)}
                className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0"
            >
                ×
            </Button>
          </DialogHeader>
          {imagePreview && (
            <div className="w-full h-full flex items-center justify-center mt-12">
               <img 
                  src={imagePreview} 
                  alt="Full Scan Preview" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
               />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

