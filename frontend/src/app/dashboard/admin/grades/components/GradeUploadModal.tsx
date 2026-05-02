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
import { Loader2, FileUp, CheckCircle2, AlertCircle, Trash2, Table, BookOpen, ChevronRight } from 'lucide-react';
import { gradeService } from '@/lib/api/services/gradeService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/lib/api/hooks/useGrades';
import { apiClient } from '@/lib/api/client';

interface GradeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export default function GradeUploadModal({ isOpen, onClose, schoolId }: GradeUploadModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch all exams for this school
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ['exams-for-upload', schoolId],
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
    queryKey: ['exam-papers-for-upload', selectedExamId],
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

  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    studentId: '',
    studentName: '',
    score: '',
  });

  const [maxMarks, setMaxMarks] = useState('100');

  // Auto-populate max marks from paper
  React.useEffect(() => {
    if (selectedPaper?.totalMarks) {
      setMaxMarks(String(selectedPaper.totalMarks));
    }
  }, [selectedPaper?.id]);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const cols = lines[0].split(',').map(h => h.trim());
        setHeaders(cols);
        
        const dataRows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          cols.forEach((h, i) => obj[h] = values[i]);
          return obj;
        });
        setRawData(dataRows);
        setStep('map');

        // Auto-mapping attempt
        const newMapping: any = { ...mapping };
        cols.forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('name')) newMapping.studentName = h;
          if (lower.includes('score') || lower.includes('mark') || lower.includes('grade')) newMapping.score = h;
          if (lower.includes('id') || lower.includes('code')) newMapping.studentId = h;
        });
        setMapping(newMapping);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const gradesToCreate = rawData.map(row => ({
        studentName: row[mapping.studentName], // For matching on backend if ID missing
        studentId: mapping.studentId === 'none' ? undefined : row[mapping.studentId],
        score: Number(row[mapping.score]),
        schoolId,
        examId: selectedExamId,
        subjectPaperId: selectedPaperId || undefined,
        classId: selectedExam?.classId,
        term: selectedExam?.term || 'FIRST',
        category: selectedExam?.category || 'EXAM',
        subject: selectedPaper?.subject?.name || selectedPaper?.title || '',
        maxMarks: Number(maxMarks),
        weight: 1.0,
        status: 'DRAFT',
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
    setFile(null);
    setRawData([]);
    setHeaders([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[3rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 shadow-2xl">
        <DialogHeader>
          <div className="h-14 w-14 rounded-2xl bg-primary dark:bg-primary/10 text-primary dark:text-primary flex items-center justify-center mb-6 shadow-inner">
             <FileUp size={28} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Batch Grade Upload</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Upload CSV or Excel files to record grades in bulk.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="py-12 space-y-6">
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5/30 transition-all cursor-pointer relative overflow-hidden"
             >
                <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
                    <FileUp size={32} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Click to upload file</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">supports .csv, .xlsx, .xls</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                />
             </div>
          </div>
        )}

        {step === 'map' && (
          <div className="space-y-8 py-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        ① Exam / Quiz Record
                    </Label>
                    <Select value={selectedExamId} onValueChange={(val) => { setSelectedExamId(val); setSelectedPaperId(''); }}>
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
                <div className="flex flex-wrap gap-2 items-end pb-1">
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


            <div className="p-8 bg-primary/5 dark:bg-primary/5 rounded-[2rem] border border-primary dark:border-primary/30 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-primary flex items-center gap-2">
                    <Table size={14} /> Column Mapping Configuration
                </h4>
                <div className="grid gap-4">
                    <div className="flex items-center justify-between gap-6">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Student Name Column</Label>
                        <Select value={mapping.studentName} onValueChange={(val) => setMapping({...mapping, studentName: val})}>
                            <SelectTrigger className="w-48 h-10 rounded-lg border-slate-200 dark:border-slate-800 font-bold">
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Student ID/Code Column</Label>
                        <Select value={mapping.studentId} onValueChange={(val) => setMapping({...mapping, studentId: val})}>
                            <SelectTrigger className="w-48 h-10 rounded-lg border-slate-200 dark:border-slate-800 font-bold">
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Match by Name)</SelectItem>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Score Column</Label>
                        <Select value={mapping.score} onValueChange={(val) => setMapping({...mapping, score: val})}>
                            <SelectTrigger className="w-48 h-10 rounded-lg border-slate-200 dark:border-slate-800 font-bold">
                                <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
           <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{rawData.length} Records Mapped Successfully</span>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => setStep('map')} className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">Re-configure</Button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden max-h-64 overflow-y-auto shadow-inner">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                       <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Extracted Score</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {rawData.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                             <td className="p-4 text-xs font-bold">{row[mapping.studentName]}</td>
                             <td className="p-4 text-xs font-black text-right">{row[mapping.score]} / {maxMarks}</td>
                          </tr>
                       ))}
                       {rawData.length > 10 && (
                          <tr><td colSpan={2} className="p-4 text-center text-[10px] font-bold text-slate-400 bg-slate-50/50 italic dark:bg-slate-900/50">... and {rawData.length - 10} more rows</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        <DialogFooter className="mt-8 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="outline" 
            onClick={step === 'upload' ? onClose : reset}
            className="flex-1 h-12 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            {step === 'upload' ? 'Cancel' : 'Restart'}
          </Button>
          <Button 
            onClick={() => {
                if (step === 'map') setStep('preview');
                else if (step === 'preview') mutation.mutate();
            }}
            disabled={mutation.isPending || (step === 'map' && (!mapping.studentName || !mapping.score || !selectedExamId || !selectedPaperId))}
            className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : step === 'map' ? 'Review Data' : 'Initialize Batch Creation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

