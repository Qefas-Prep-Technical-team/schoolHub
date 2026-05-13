'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, BookOpen } from 'lucide-react';

interface EditGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, score: number, remarks: string) => void;
  grade: {
    id: string;
    name: string;
    studentCode: string;
    assessmentType: string;
    score: number | string;
    maxMarks: number;
    remarks?: string;
  } | null;
  isSaving?: boolean;
}

const EditGradeModal: React.FC<EditGradeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  grade,
  isSaving = false 
}) => {
  const [score, setScore] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grade && isOpen) {
      // Extract numeric score from strings like "18/20" or just use item.score if passed
      const rawScore = typeof grade.score === 'string' ? grade.score.split('/')[0] : grade.score;
      setScore(String(rawScore || '0'));
      setRemarks(grade.remarks || '');
      setError(null);
    }
  }, [grade, isOpen]);

  const handleSave = () => {
    const numericScore = parseFloat(score);
    const maxMarks = grade?.maxMarks || 100;

    if (isNaN(numericScore)) {
      setError('Please enter a valid number');
      return;
    }

    if (numericScore < 0 || numericScore > maxMarks) {
      setError(`Score must be between 0 and ${maxMarks}`);
      return;
    }

    if (!grade) return;
    onSave(grade.id, numericScore, remarks);
  };

  if (!grade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BookOpen size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Edit Student Grade</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                Update assessment results for this student.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">{grade.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{grade.studentCode} • {grade.assessmentType}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="score" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Score (out of {grade.maxMarks || 100})
            </Label>
            <div className="relative">
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setError(null);
                }}
                className={`text-lg font-bold h-12 ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                / {grade.maxMarks || 100}
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remarks" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Teacher Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any comments about the student's performance..."
              className="resize-none border-slate-200 dark:border-slate-700 h-24"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-primary hover:bg-primary/90 text-white px-8 h-11"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGradeModal;
