"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { imageService } from '@/lib/api/services/imageService';
import { gradeService } from '@/lib/api/services/gradeService';
import { OfflineStudentGradeEntry } from '../types';
import { toast } from 'react-toastify';

interface OfflineGradesOCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  maxMarks: number;
  roster: OfflineStudentGradeEntry[];
  isTeacher?: boolean;
  onImportScores: (scoresMap: Record<string, { score: number; remarks?: string }>) => void;
}

export default function OfflineGradesOCRModal({
  isOpen,
  onClose,
  schoolId,
  maxMarks,
  roster,
  isTeacher = false,
  onImportScores,
}: OfflineGradesOCRModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedMap, setExtractedMap] = useState<Record<string, { score: number; remarks?: string }>>({});
  const [matchedCount, setMatchedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setExtractedMap({});
    setMatchedCount(0);
  };

  const handleProcessScan = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // 1. Upload the image to storage
      const { publicUrl } = await imageService.proxyUploadToBunny(file, schoolId);

      // 2. Call OCR backend
      const res = await gradeService.processOCR(publicUrl);
      const rawGrades = Array.isArray(res?.grades) ? res.grades : (Array.isArray(res) ? res : []);

      if (rawGrades.length === 0) {
        toast.warning('No legible grades detected from the image. Please ensure handwriting is clear.');
        setIsProcessing(false);
        return;
      }

      // 3. Match extracted grades to roster students
      const map: Record<string, { score: number; remarks?: string }> = {};
      let count = 0;

      rawGrades.forEach((rg: any) => {
        const studentName = (rg.studentName || '').toLowerCase().trim();
        const studentCode = (rg.studentCode || '').toLowerCase().trim();
        const score = parseFloat(rg.score);

        if (isNaN(score)) return;

        // Find best match in roster
        const match = roster.find(s =>
          (studentCode && s.studentCode?.toLowerCase() === studentCode) ||
          (studentName && s.studentName.toLowerCase().includes(studentName))
        );

        if (match) {
          const clampedScore = Math.min(maxMarks, Math.max(0, score));
          map[match.studentId] = { score: clampedScore, remarks: rg.remarks || 'Scanned via AI' };
          count++;
        }
      });

      setExtractedMap(map);
      setMatchedCount(count);
      toast.success(`Successfully extracted ${count} scores from the grade sheet!`);
    } catch (err: any) {
      console.error('[OCR Error]:', err);
      toast.error(err?.message || 'Failed to scan and extract grades from sheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (Object.keys(extractedMap).length > 0) {
      onImportScores(extractedMap);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:w-full max-w-2xl rounded-2xl dark:bg-slate-900 dark:border-slate-800 p-6">
        <DialogHeader>
          <div className={`size-10 rounded-xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'} flex items-center justify-center mb-2`}>
            <Camera size={20} />
          </div>
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
            Scan Physical Grade Sheet (AI Vision)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Snap a clear photo or upload a scanned image of your handwritten or printed grade sheet. Antigravity AI will recognize names, admission codes, and score marks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Upload / Capture box */}
          <div className={`p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 ${isTeacher ? 'hover:border-emerald-400 dark:hover:border-emerald-600' : 'hover:border-indigo-400 dark:hover:border-indigo-600'} transition-colors text-center`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="space-y-3">
                {/* Image preview */}
                <div className="max-h-48 overflow-hidden rounded-lg mx-auto flex items-center justify-center bg-black/5 dark:bg-black/30">
                  <img
                    src={previewUrl}
                    alt="Grade sheet preview"
                    className="max-h-48 object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-bold"
                  >
                    Retake / Choose Another
                  </Button>
                  <Button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessScan}
                    className={`h-8 ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-bold gap-1.5`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Scanning Sheet...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        Extract Scores
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <Camera size={28} className="text-slate-400" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Take a photo or upload grade sheet image
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 rounded-xl text-xs font-bold"
                >
                  Snap Photo / Select Image
                </Button>
              </div>
            )}
          </div>

          {/* Results Badge */}
          {matchedCount > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span>Matched <strong>{matchedCount}</strong> student scores from your photo!</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={matchedCount === 0 || isProcessing}
            onClick={handleApply}
            className={`rounded-xl ${isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-xs font-bold shadow-md`}
          >
            Apply Scanned Scores ({matchedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
