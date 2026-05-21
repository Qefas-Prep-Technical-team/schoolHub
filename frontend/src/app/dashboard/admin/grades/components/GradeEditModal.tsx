"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { gradeService } from '@/lib/api/services/gradeService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/lib/api/hooks/useGrades';

interface GradeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: any; // contains the grade record to edit
}

export default function GradeEditModal({ isOpen, onClose, grade }: GradeEditModalProps) {
  const queryClient = useQueryClient();

  const [score, setScore] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Populate fields when a grade is loaded
  useEffect(() => {
    if (grade) {
      setScore(String(grade.score ?? ''));
      setRemarks(grade.remarks ?? '');
    }
  }, [grade]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!grade?.id) return null;
      const payload: { score?: number; remarks?: string } = {};
      if (score !== '') payload.score = Number(score);
      if (remarks !== '') payload.remarks = remarks;
      return gradeService.updateGradeScore(grade.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
      onClose();
    },
    onError: (err) => {
      console.error('Failed to update grade', err);
    },
  });

  const isFormValid = score !== '' && !isNaN(Number(score));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
            Edit Grade
          </DialogTitle>
          <DialogDescription className="mt-2 text-slate-600 dark:text-slate-300">
            Modify the score and remarks for {grade?.student?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Score (out of {grade?.maxMarks || 100})
            </label>
            <Input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter new score"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Remarks (optional)
            </label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks"
            />
          </div>
        </div>
        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !isFormValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="mr-1" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
