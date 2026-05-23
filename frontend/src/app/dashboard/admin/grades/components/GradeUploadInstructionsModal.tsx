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
import { Info, FileUp } from 'lucide-react';

interface GradeUploadInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export default function GradeUploadInstructionsModal({ isOpen, onClose, onProceed }: GradeUploadInstructionsModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleProceed = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideGradeUploadInstructions', 'true');
    }
    onProceed();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-2xl">
        <DialogHeader>
          <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 shadow-inner">
             <Info size={28} />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Before You Upload</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Important information regarding batch grade uploads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-xs">1</span>
              Exam Prerequisites
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
              An exam must be created before adding grades. If it's a multiple paper exam, a subject paper must be created first.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-xs">2</span>
              CSV Formatting & Name Matching
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
              Your CSV or Excel file should have clear column headers (e.g., "Student Name", "Student ID (optional)", "Score"). 
              <strong> The names in the file must closely match the students' names as registered.</strong> Our system will attempt to auto-match them. Any unrecognized names can either be discarded or automatically created as new students during the upload.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 pl-2">
            <input 
              type="checkbox" 
              id="dontShow" 
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <label htmlFor="dontShow" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Don't show this message again
            </label>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-3">
          <Button variant="outline" onClick={onClose} className="h-12 rounded-xl font-bold transition-all w-24">
            Cancel
          </Button>
          <Button onClick={handleProceed} className="h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest flex-1">
            <FileUp size={16} className="mr-2" /> Continue to Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
