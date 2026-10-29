import { useState, useEffect } from 'react';
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
import { useGradeSettingsStore } from '@/lib/api/hooks/useGradeSettingsStore';
import { Settings2, RotateCcw, Loader2, Building, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { GradingTier } from '@/utils/gradingSystem';

interface GradeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName?: string;
  hasCustomSchoolSystem?: boolean;
  effectiveGradingScale?: GradingTier[];
}

const GradeSettingsModal: React.FC<GradeSettingsModalProps> = ({
  isOpen,
  onClose,
  schoolName,
  hasCustomSchoolSystem = false,
  effectiveGradingScale = [],
}) => {
  const { gradingScale, updateThreshold, resetToDefault } = useGradeSettingsStore();
  
  // Local state to handle input strings (allowing empty strings during editing)
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when modal opens or gradingScale changes
  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      gradingScale.forEach(t => {
        initialValues[t.grade] = t.minPercentage.toString();
      });
      setLocalValues(initialValues);
    }
  }, [isOpen, gradingScale]);

  const handleInputChange = (grade: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [grade]: value }));
    
    // Automatically update store if valid, but don't block empty string
    const percentage = parseInt(value);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      updateThreshold(grade, percentage);
    }
  };

  const handleReset = () => {
    resetToDefault();
    toast.success("Settings reset to defaults");
    // After reset, useEffect will sync local values
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate network delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsSaving(false);
    toast.success("Grade settings saved successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Settings2 size={20} />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Grading System Configuration</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Standardized academic grade boundaries applied across your assessments and grade calculations.
          </DialogDescription>
        </DialogHeader>

        {/* Institution / Default Source Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 my-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <Building size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {schoolName || 'Connected School Institution'}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                hasCustomSchoolSystem
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
              }`}>
                <ShieldCheck size={11} />
                {hasCustomSchoolSystem ? 'School Configured' : 'Standard 9-Grade'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {hasCustomSchoolSystem
                ? 'Active boundaries synchronized directly from School Profile settings.'
                : 'Using the standard 9-tier academic matrix (A+, A, B+, B, C+, C, D, F, F9).'}
            </p>
          </div>
        </div>

        {/* Active Scale Grid */}
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 py-2">
          {effectiveGradingScale.map((tier) => (
            <div
              key={tier.grade}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-xs shadow-xs">
                  {tier.grade}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Grade {tier.grade}
                  </p>
                  {tier.remark && (
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {tier.remark}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                  {tier.min}% – {tier.max}%
                </span>
                <p className="text-[10px] text-slate-400 font-medium">threshold</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-2">
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSettingsModal;
