"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Camera, UploadCloud, Sparkles, CheckCircle2, User, AlertCircle, FileText, Trash2, SplitSquareVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { imageService } from "@/lib/api/services/imageService";
import { gradeService } from "@/lib/api/services/gradeService";
import { adminService } from "@/lib/api/services/adminService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStudents } from "@/lib/api/hooks/useStudent";

export type UploadCategory = "assignment" | "quiz" | "ca" | "exam" | "all";

interface ResultRecordUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[]; // The students in the table
  schoolId: string;
  classId: string;
  onUploadComplete: (mappedData: any[], category: UploadCategory) => void;
}

export default function ResultRecordUploadModal({
  isOpen,
  onClose,
  students,
  schoolId,
  classId,
  onUploadComplete,
}: ResultRecordUploadModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"select" | "upload" | "processing" | "verify" | "reconcile">("select");
  const [category, setCategory] = useState<UploadCategory>("exam");
  const [uploadMethod, setUploadMethod] = useState<"csv" | "ocr" | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [unmatchedData, setUnmatchedData] = useState<any[]>([]);
  const [matchedData, setMatchedData] = useState<any[]>([]);
  const [outOfClassData, setOutOfClassData] = useState<any[]>([]);
  
  // Fetch all students for the school to check if unmatched students exist in the school
  const { data: allStudentsData } = useStudents(schoolId);
  const allStudents = (allStudentsData || []) as any[];

  const reset = () => {
    setStep("select");
    setUploadMethod(null);
    setExtractedData([]);
    setImagePreview(null);
    setUnmatchedData([]);
    setMatchedData([]);
    setOutOfClassData([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ----- CSV/Excel Upload -----
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("processing");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Use raw objects
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length === 0) {
          toast.error("File is empty.");
          setStep("upload");
          return;
        }

        // Try to guess columns
        const keys = Object.keys(json[0] || {});
        
        const mapped = json.map((row: any) => {
          // guess name
          const nameKey = keys.find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("student"));
          
          if (category === "all") {
             const assignKey = keys.find(k => k.toLowerCase().includes("assign"));
             const quizKey = keys.find(k => k.toLowerCase().includes("quiz") || k.toLowerCase().includes("test"));
             const caKey = keys.find(k => k.toLowerCase() === "ca" || k.toLowerCase().includes("continuous") || k.toLowerCase().includes("assessment"));
             const examKey = keys.find(k => k.toLowerCase().includes("exam") || k.toLowerCase().includes("final"));
             return {
                studentName: nameKey ? row[nameKey] : Object.values(row)[0],
                assignment: assignKey ? row[assignKey] : "",
                quiz: quizKey ? row[quizKey] : "",
                ca: caKey ? row[caKey] : "",
                exam: examKey ? row[examKey] : ""
             };
          } else {
             const exactCategoryKey = keys.find(k => k.toLowerCase().includes(category));
             const scoreKey = keys.find(k => k.toLowerCase().includes("score") || k.toLowerCase().includes("mark") || k.toLowerCase().includes("grade"));
             return {
                studentName: nameKey ? row[nameKey] : Object.values(row)[0],
                score: exactCategoryKey ? row[exactCategoryKey] : (scoreKey ? row[scoreKey] : Object.values(row)[1])
             };
          }
        });

        setExtractedData(mapped);
        setStep("verify");
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Failed to parse file.");
        setStep("upload");
      }
    };
    reader.readAsBinaryString(file);
  };

  // ----- OCR Upload -----
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);

      setStep("processing");
      try {
        toast.loading("Uploading image...", { id: "ocr-modal" });
        let publicUrl = "";
        try {
          const result = await imageService.proxyUploadToBunny(file);
          publicUrl = result.publicUrl;
        } catch {
          const result = await imageService.uploadToSupabase(file);
          publicUrl = result.publicUrl;
        }

        toast.loading("AI is scanning your mark sheet...", { id: "ocr-modal" });
        const data = await gradeService.processOCR(publicUrl);
        const finalGrades = Array.isArray(data) ? data : (data?.grades || data?.data || []);
        const grades = Array.isArray(finalGrades) ? finalGrades : [];

        if (grades.length === 0) {
          throw new Error("No grades could be extracted from this image.");
        }

        // If category is "all", we try to map the OCR result loosely.
        const mappedGrades = grades.map((g: any) => {
          if (category === "all") {
             return {
               studentName: g.studentName || g.name || "",
               assignment: g.assignment || "",
               quiz: g.quiz || "",
               ca: g.ca || "",
               exam: g.exam || g.score || "",
             };
          }
          return {
             studentName: g.studentName || g.name || "",
             score: g.score !== undefined ? g.score : (g[category as keyof typeof g] !== undefined ? g[category as keyof typeof g] : "")
          };
        });

        setExtractedData(mappedGrades);
        setStep("verify");
        toast.success(`Extracted ${mappedGrades.length} student records!`, { id: "ocr-modal" });
      } catch (error: any) {
        console.error("OCR Failed:", error);
        toast.error(error.message || "Failed to scan image. Please try again.", { id: "ocr-modal" });
        setStep("upload");
      }
    }
  };

  const updateExtracted = (index: number, field: string, value: any) => {
    const newData = [...extractedData];
    newData[index] = { ...newData[index], [field]: value };
    setExtractedData(newData);
  };

  const removeExtracted = (index: number) => {
    setExtractedData(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    // Attempt to match extracted data with students
    const matched: any[] = [];
    const unmatched: any[] = [];
    const outOfClass: any[] = [];

    extractedData.forEach(row => {
      const ocrName = row.studentName || row.name || "";
      
      const foundInClass = students.find(s => s.name?.toLowerCase().trim() === ocrName?.toLowerCase().trim());
      
      if (foundInClass) {
        matched.push({
          ...row,
          studentId: foundInClass.id,
          matched: true
        });
      } else {
        if (ocrName.trim()) {
           const foundInSchool = allStudents.find(s => s.name?.toLowerCase().trim() === ocrName?.toLowerCase().trim());
           if (foundInSchool) {
              outOfClass.push({
                 ...row,
                 studentId: foundInSchool.id,
                 matched: false
              });
           } else {
              unmatched.push({
                ...row,
                studentId: null,
                matched: false
              });
           }
        }
      }
    });

    setMatchedData(matched);
    setUnmatchedData(unmatched);
    setOutOfClassData(outOfClass);

    if (unmatched.length > 0 || outOfClass.length > 0) {
       setStep("reconcile");
    } else {
       onUploadComplete(matched, category);
       handleClose();
    }
  };

  const updateClassMutation = useMutation({
    mutationFn: async () => {
      return outOfClassData.map(un => ({
        ...un,
        matched: true,
        isNew: true // We flag as new so it gets added to the table UI
      }));
    },
    onSuccess: (added) => {
      const allMatched = [...matchedData, ...added];
      setMatchedData(allMatched);
      setOutOfClassData([]);
      
      // If there are no more unmatched students, complete upload
      if (unmatchedData.length === 0) {
        toast.success(`Successfully added ${added.length} existing students to table!`);
        onUploadComplete(allMatched, category);
        handleClose();
      } else {
        toast.success(`Successfully added ${added.length} existing students. Now resolve unmatched.`);
      }
    }
  });

  const createMissingMutation = useMutation({
    mutationFn: async () => {
      const newStudents = [];
      for (const un of unmatchedData) {
        if (!un.studentName) continue;
        const res = await adminService.createStudent({
          fullName: un.studentName,
          classId: classId,
          schoolId: schoolId,
        });
        const createdId = res?.data?.student?.id || res?.data?.id || res?.id;
        if (createdId) {
          newStudents.push({
            ...un,
            studentId: createdId,
            studentName: un.studentName, // preserve exact name created
            matched: true,
            isNew: true, // flag to indicate we just created it
          });
        }
      }
      return newStudents;
    },
    onSuccess: (newlyCreated) => {
      // we merge with outOfClassData as well if they were accepted
      // actually outOfClass might still be pending if they didn't click it, but they'd be separate.
      const allMatched = [...matchedData, ...newlyCreated];
      setMatchedData(allMatched);
      setUnmatchedData([]);
      queryClient.invalidateQueries({ queryKey: ["school-students"] });
      
      if (outOfClassData.length === 0) {
         toast.success(`Successfully created ${newlyCreated.length} missing students!`);
         onUploadComplete(allMatched, category);
         handleClose();
      } else {
         toast.success(`Successfully created ${newlyCreated.length} missing students. Now resolve out of class.`);
      }
    },
    onError: () => {
      toast.error('Failed to create some students. Check required fields or try creating them manually.');
    }
  });

  const handleSkipMissing = () => {
     if (outOfClassData.length === 0) {
       onUploadComplete(matchedData, category);
       handleClose();
     } else {
       setUnmatchedData([]);
     }
  };

  const handleSkipOutOfClass = () => {
     if (unmatchedData.length === 0) {
       onUploadComplete(matchedData, category);
       handleClose();
     } else {
       setOutOfClassData([]);
     }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-0 border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UploadCloud size={20} />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Batch Upload Grades</DialogTitle>
            <DialogDescription className="text-xs">
              Upload scores via CSV, Excel, or AI Image Scan
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 h-[500px] overflow-y-auto">
          {step === "select" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Which column are you uploading for?</Label>
                <Select value={category} onValueChange={(v: UploadCategory) => setCategory(v)}>
                  <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-bold">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="ca">CA (Continuous Assessment)</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="all" className="font-bold text-primary">All Columns (Combined)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Choose Upload Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => { setUploadMethod("csv"); setStep("upload"); }}
                    className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">CSV / Excel File</span>
                  </div>

                  <div 
                    onClick={() => { setUploadMethod("ocr"); setStep("upload"); }}
                    className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center relative">
                      <Camera size={24} />
                      <Sparkles size={12} className="absolute -top-1 -right-1 text-amber-500" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">AI Image Scanner</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "upload" && uploadMethod === "csv" && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-20 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all h-full"
            >
              <FileText size={48} className="text-slate-400" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Click to upload CSV or Excel</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" />
            </div>
          )}

          {step === "upload" && uploadMethod === "ocr" && (
            <div 
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-20 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all h-full"
            >
              <Camera size={48} className="text-slate-400" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Click to upload Mark Sheet Image</p>
              <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
          )}

          {step === "processing" && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 border-4 border-primary/20 rounded-full" />
                <div className="h-24 w-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
                {uploadMethod === "ocr" ? <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} /> : <FileText className="absolute inset-0 m-auto text-primary" size={32} />}
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300 animate-pulse">
                {uploadMethod === "ocr" ? "AI is processing your image..." : "Parsing file..."}
              </p>
            </div>
          )}

          {step === "verify" && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <SplitSquareVertical size={16} className="text-primary" /> Review Extracted Data
                </h4>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{extractedData.length} records</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl">
                {extractedData.map((grade, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="flex-1">
                      <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Student Name / ID</Label>
                      <Input 
                        value={grade.studentName || ""} 
                        onChange={(e) => updateExtracted(i, "studentName", e.target.value)}
                        className="h-8 font-bold text-sm bg-transparent border-slate-100"
                        placeholder="Name..."
                      />
                    </div>
                    {category === "all" ? (
                       <>
                        <div className="w-16">
                          <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Assign</Label>
                          <Input 
                            type="number" 
                            value={grade.assignment || ""} 
                            onChange={(e) => updateExtracted(i, "assignment", e.target.value)}
                            className="h-8 font-bold text-xs text-center bg-primary/5 border-primary/20 px-1"
                          />
                        </div>
                        <div className="w-16">
                          <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Quiz</Label>
                          <Input 
                            type="number" 
                            value={grade.quiz || ""} 
                            onChange={(e) => updateExtracted(i, "quiz", e.target.value)}
                            className="h-8 font-bold text-xs text-center bg-primary/5 border-primary/20 px-1"
                          />
                        </div>
                        <div className="w-16">
                          <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1">CA</Label>
                          <Input 
                            type="number" 
                            value={grade.ca || ""} 
                            onChange={(e) => updateExtracted(i, "ca", e.target.value)}
                            className="h-8 font-bold text-xs text-center bg-primary/5 border-primary/20 px-1"
                          />
                        </div>
                        <div className="w-16">
                          <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Exam</Label>
                          <Input 
                            type="number" 
                            value={grade.exam || ""} 
                            onChange={(e) => updateExtracted(i, "exam", e.target.value)}
                            className="h-8 font-bold text-xs text-center bg-primary/5 border-primary/20 px-1"
                          />
                        </div>
                       </>
                    ) : (
                       <div className="w-24">
                         <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</Label>
                         <Input 
                           type="number" 
                           value={grade.score || ""} 
                           onChange={(e) => updateExtracted(i, "score", e.target.value)}
                           className="h-8 font-bold text-sm text-center bg-primary/5 border-primary/20"
                           placeholder="Score"
                         />
                       </div>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeExtracted(i)}
                      className="mt-5 h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
                <Button onClick={handleApply} className="gap-2">
                  <CheckCircle2 size={16} />
                  Match Students
                </Button>
              </div>
            </div>
          )}

          {step === "reconcile" && (
            <div className="h-full flex flex-col space-y-6">
              
              {outOfClassData.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 p-6 flex-1 flex flex-col min-h-[250px]">
                   <h4 className="text-sm font-black text-amber-600 flex items-center gap-2 mb-2">
                     <AlertCircle size={18} />
                     {outOfClassData.length} Students Not In Class
                   </h4>
                   <p className="text-xs text-amber-700/80 mb-4">
                     The following students exist in the database, but are not currently listed in this class's table. Do you want to add their grades anyway?
                   </p>
                   <div className="flex-1 border border-amber-200/50 dark:border-amber-800/50 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 custom-scrollbar mb-4 overflow-y-auto">
                       <table className="w-full text-left">
                         <thead className="bg-amber-100/50 dark:bg-amber-900/20 sticky top-0">
                             <tr className="border-b border-amber-200/50 dark:border-amber-800/50">
                               <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-amber-500">Name</th>
                               {category === "all" ? (
                                 <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-amber-500 text-right">Scores</th>
                               ) : (
                                 <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-amber-500 text-right">Score</th>
                               )}
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-amber-100 dark:divide-amber-900/20">
                             {outOfClassData.slice(0, 10).map((row, i) => (
                               <tr key={i}>
                                   <td className="p-3 px-4 text-xs font-bold text-amber-700 dark:text-amber-300">{row.studentName}</td>
                                   <td className="p-3 px-4 text-[10px] font-black text-right text-amber-700 dark:text-amber-300">
                                     {category === "all" ? `${row.assignment || '-'} | ${row.quiz || '-'} | ${row.ca || '-'} | ${row.exam || '-'}` : row.score}
                                   </td>
                               </tr>
                             ))}
                             {outOfClassData.length > 10 && (
                               <tr><td colSpan={2} className="p-3 text-center text-[10px] font-bold text-amber-500 italic">... and {outOfClassData.length - 10} more rows</td></tr>
                             )}
                         </tbody>
                       </table>
                   </div>
                   <div className="flex items-center justify-between pt-2">
                      <Button 
                         onClick={handleSkipOutOfClass}
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
                <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-200 dark:border-rose-900/30 p-6 flex-1 flex flex-col min-h-[250px]">
                   <h4 className="text-sm font-black text-rose-600 flex items-center gap-2 mb-2">
                     <AlertCircle size={18} />
                     {unmatchedData.length} Unrecognized Students Found
                   </h4>
                   <p className="text-xs text-rose-700/80 mb-4">
                     The following students from your scan could not be matched to existing records in the school. Would you like to create accounts for them?
                   </p>
                   <div className="flex-1 border border-rose-200/50 dark:border-rose-800/50 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 custom-scrollbar mb-4 overflow-y-auto">
                       <table className="w-full text-left">
                         <thead className="bg-rose-100/50 dark:bg-rose-900/20 sticky top-0">
                             <tr className="border-b border-rose-200/50 dark:border-rose-800/50">
                               <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-rose-500">Name</th>
                               {category === "all" ? (
                                 <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-rose-500 text-right">Scores</th>
                               ) : (
                                 <th className="p-3 px-4 text-[10px] font-black uppercase tracking-widest text-rose-500 text-right">Score</th>
                               )}
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-rose-100 dark:divide-rose-900/20">
                             {unmatchedData.slice(0, 10).map((row, i) => (
                               <tr key={i}>
                                   <td className="p-3 px-4 text-xs font-bold text-rose-700 dark:text-rose-300">{row.studentName}</td>
                                   <td className="p-3 px-4 text-[10px] font-black text-right text-rose-700 dark:text-rose-300">
                                     {category === "all" ? `${row.assignment || '-'} | ${row.quiz || '-'} | ${row.ca || '-'} | ${row.exam || '-'}` : row.score}
                                   </td>
                               </tr>
                             ))}
                             {unmatchedData.length > 10 && (
                               <tr><td colSpan={2} className="p-3 text-center text-[10px] font-bold text-rose-500 italic">... and {unmatchedData.length - 10} more rows</td></tr>
                             )}
                         </tbody>
                       </table>
                   </div>
                   <div className="flex items-center justify-between pt-2">
                      <Button 
                         onClick={handleSkipMissing}
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
