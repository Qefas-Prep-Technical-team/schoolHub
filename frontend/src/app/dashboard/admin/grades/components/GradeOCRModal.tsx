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
import { Loader2, Camera, Sparkles, CheckCircle2, User, Edit3, Trash2, SplitSquareVertical, BookOpen, ChevronRight } from 'lucide-react';
import { gradeService } from '@/lib/api/services/gradeService';
import { imageService } from '@/lib/api/services/imageService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/lib/api/hooks/useGrades';
import { apiClient } from '@/lib/api/client';
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

  const [step, setStep] = useState<'upload' | 'processing' | 'verify'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedGrades, setExtractedGrades] = useState<any[]>([]);
  const [showFullImage, setShowFullImage] = useState(false);
  
  const [maxMarks, setMaxMarks] = useState('100');

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
        // 1. Upload to storage via Backend Proxy (CORS/DNS Safe)
        const { publicUrl } = await imageService.proxyUploadToBunny(file);
        
        // 3. Process with AI
        const data = await gradeService.processOCR(publicUrl);
        // Robust handling of data (could be array or object with grades/data key)
        const finalGrades = Array.isArray(data) ? data : (data?.grades || data?.data || []);
        setExtractedGrades(Array.isArray(finalGrades) ? finalGrades : []);
        setStep('verify');
      } catch (error) {
        console.error("OCR Failed:", error);
        setStep('upload');
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const gradesToCreate = (extractedGrades || []).map(g => ({
        studentName: g.studentName,
        score: Number(g.score),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
      onClose();
      reset();
    },
  });

  const reset = () => {
    setStep('upload');
    setImagePreview(null);
    setExtractedGrades([]);
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
      <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto rounded-[3rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 shadow-2xl">
        <DialogHeader>
          <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
             <Camera size={28} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             AI Vision Grade Scanner <Sparkles className="text-amber-400 fill-amber-400" size={24} />
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Scan physical mark sheets to automatically extract student names and scores.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
           <div className="py-12">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-24 flex flex-col items-center justify-center gap-6 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden"
              >
                 <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-700 shadow-xl group-hover:shadow-indigo-500/40">
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
           </div>
        )}

        {step === 'processing' && (
            <div className="py-32 flex flex-col items-center justify-center gap-8">
                <div className="relative">
                    <div className="h-32 w-32 border-8 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
                    <div className="h-32 w-32 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
                    <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={40} />
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
                    className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative group cursor-zoom-in hover:border-indigo-500/50 transition-all"
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
                            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-xl">Click to expand</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: AI Extracted Data */}
                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                            <SplitSquareVertical size={16} className="text-indigo-600" /> Extracted Metadata
                        </h4>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">{(extractedGrades || []).length} rows found</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {(extractedGrades || []).map((grade, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-indigo-500/50 transition-all shadow-sm">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <User size={18} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Input 
                                        value={grade.studentName} 
                                        onChange={(e) => updateExtractedGrade(i, 'studentName', e.target.value)}
                                        className="h-8 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0"
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-500/5 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                            <span className="text-[10px] font-black text-indigo-600">SCORE:</span>
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

             {/* Global Metadata Form */}
             <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative overflow-hidden">
                <div className="space-y-2 z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">① Exam / Quiz Record</Label>
                    <Select value={selectedExamId} onValueChange={(val) => { setSelectedExamId(val); setSelectedPaperId(''); }}>
                        <SelectTrigger className="h-10 rounded-xl border-slate-800 bg-slate-800 shadow-inner font-bold border-none text-slate-200">
                            <SelectValue placeholder={isLoadingExams ? 'Loading exams...' : 'Choose exam...'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-800">
                            {exams.map((e: any) => (
                                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">② Subject Paper</Label>
                    <Select value={selectedPaperId} onValueChange={setSelectedPaperId} disabled={!selectedExamId}>
                        <SelectTrigger className="h-10 rounded-xl border-slate-800 bg-slate-800 shadow-inner font-bold border-none text-slate-200">
                            <SelectValue placeholder={!selectedExamId ? 'Select exam first' : 'Choose paper...'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-800">
                            {papers.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Marks</Label>
                    <Input 
                        type="number"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(e.target.value)}
                        className="h-10 rounded-xl border-slate-800 bg-slate-800 shadow-inner font-bold border-none text-slate-200"
                    />
                </div>
                <div className="flex flex-col justify-end gap-1 pb-1 z-10">
                    {selectedExam?.class && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Class: {selectedExam.class.name}</span>
                    )}
                    {selectedExam?.term && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Term: {selectedExam.term}</span>
                    )}
                </div>
                <Sparkles className="absolute -right-12 -bottom-12 text-white/5" size={200} />
             </div>
           </div>
        )}

        <DialogFooter className="mt-8 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="outline" 
            onClick={step === 'upload' ? onClose : reset}
            className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 transition-all"
          >
            {step === 'upload' ? 'Cancel' : 'Restart Scanner'}
          </Button>
          <Button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || step !== 'verify' || !selectedExamId || !selectedPaperId}
            className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Initialize Draft Save</span>
            )}
          </Button>
        </DialogFooter>
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
