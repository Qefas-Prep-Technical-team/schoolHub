import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useSchoolSubjects } from '@/lib/api/hooks/useSchool';
import { useAssignTeacherToSubject } from '@/lib/api/hooks/useAdmin';
import Button from './ui/Button';

interface AssignSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  schoolId: string;
  primaryColor: string;
}

export function AssignSubjectModal({ isOpen, onClose, teacherId, schoolId, primaryColor }: AssignSubjectModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const { data: subjects = [], isLoading: loadingSubjects } = useSchoolSubjects(schoolId);
  
  const assignMutation = useAssignTeacherToSubject(teacherId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    
    assignMutation.mutate(selectedSubject, {
      onSuccess: () => {
        setSelectedSubject('');
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assign to Subject</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Subject</label>
            {loadingSubjects ? (
              <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-slate-400" />
              </div>
            ) : (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:outline-none transition-all"
                style={{ focusRingColor: primaryColor }}
                required
              >
                <option value="" disabled>Choose a subject...</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedSubject || assignMutation.isPending}
              style={{ backgroundColor: (!selectedSubject || assignMutation.isPending) ? undefined : primaryColor }}
              className={`border-none ${!selectedSubject || assignMutation.isPending ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200'}`}
            >
              {assignMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Assigning...</span>
                </span>
              ) : (
                'Assign Teacher'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
