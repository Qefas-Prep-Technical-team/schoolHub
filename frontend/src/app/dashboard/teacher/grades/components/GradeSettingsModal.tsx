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
import { Settings2, RotateCcw } from 'lucide-react';

interface GradeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GradeSettingsModal: React.FC<GradeSettingsModalProps> = ({ isOpen, onClose }) => {
  const { gradingScale, updateThreshold, resetToDefault } = useGradeSettingsStore();
  
  // Local state to handle input strings (allowing empty strings during editing)
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

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
    // After reset, useEffect will sync local values
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings2 size={20} />
            </div>
            <DialogTitle className="text-xl font-bold">Grading Scale Settings</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Define the minimum percentage required for each grade letter. These settings will be applied to all your grade calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {gradingScale.map((threshold) => (
            <div key={threshold.grade} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`grade-${threshold.grade}`} className="text-right font-bold text-lg">
                Grade {threshold.grade}
              </Label>
              <div className="col-span-3 flex items-center gap-3">
                <Input
                  id={`grade-${threshold.grade}`}
                  type="number"
                  value={localValues[threshold.grade] ?? threshold.minPercentage.toString()}
                  onChange={(e) => handleInputChange(threshold.grade, e.target.value)}
                  className="w-24 border-slate-200 dark:border-slate-700 focus:ring-primary shadow-sm"
                  min="0"
                  max="100"
                />
                <span className="text-slate-500 dark:text-slate-400 font-medium">% or higher</span>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white px-8">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSettingsModal;
